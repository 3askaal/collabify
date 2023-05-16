import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sampleSize } from 'lodash';
import * as SpotifyWebApi from 'spotify-web-api-node';
import * as sequential from 'promise-sequential';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation } from '../../../types/playlist';
import { simplifyParticipations } from './playlist.helpers';

const getSpotifyInstance = async (refreshToken: string): Promise<any> => {
  const instance = new SpotifyWebApi({
    redirectUri: `${process.env.PROD_URL}/callback`,
    clientId: process.env.SPOTIFY_API_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_API_SECRET_ID,
    refreshToken,
  });

  const accessToken = await instance.refreshAccessToken().then(
    (data) => {
      return data.body['access_token'];
    },
    (err) => {
      throw err;
    },
  );

  instance.setAccessToken(accessToken);

  return instance;
};

const onSuccess = (data) => {
  return data.body;
};

const onError = (err) => {
  console.log('ERROR: ', err); // eslint-disable-line
};

@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
  ) {}

  async create(payload: IPlaylist): Promise<Playlist> {
    const now = new Date();
    const doc = await this.playlistModel.create({
      ...payload,
      participations: payload.participations.map((participation) => ({
        ...participation,
        submittedAt: now,
      })),
    });
    return doc;
  }

  async get(playlistId: string): Promise<Playlist> {
    return this.playlistModel.findById(playlistId);
  }

  async getParticipated(userId: string): Promise<Playlist[]> {
    return this.playlistModel.find({
      'participations.$.user.id': userId,
    });
  }

  async participate(
    playlistId: string,
    participation: IParticipation,
  ): Promise<Playlist> {
    return this.playlistModel.findByIdAndUpdate(playlistId, {
      $push: {
        participations: {
          ...participation,
          submittedAt: new Date(),
        },
      },
    });
  }

  async release(playlistId: string): Promise<any> {
    const playlist: IPlaylist = await this.playlistModel.findById(playlistId);
    const participations = simplifyParticipations(playlist.participations);

    const defaultTitle = participations
      .map(({ user: { name } }) => name)
      .join(' x ');
    const defaultDescription = 'Generated with https://collabify.vercel.app';

    const hostParticipation: IParticipation = playlist.participations.find(
      ({ user }): boolean => user.host,
    );

    const spotifyApiInstance = await getSpotifyInstance(
      hostParticipation.user.refreshToken,
    );

    const { id: spotifyPlaylistId } = await spotifyApiInstance
      .createPlaylist(hostParticipation.user.id, {
        name: playlist.title || defaultTitle,
        description: playlist.description || defaultDescription,
        public: false,
      })
      .then(onSuccess, onError);

    await sequential(
      participations.map(({ user, data }) => async () => {
        const tracks = sampleSize(data.tracks, 20).map(({ id }) => id);

        const refreshToken = !user.bot
          ? user.refreshToken
          : hostParticipation.user.refreshToken;

        const spotifyApiInstance = await getSpotifyInstance(refreshToken);

        return spotifyApiInstance
          .addTracksToPlaylist(spotifyPlaylistId, tracks)
          .then(onSuccess, onError);
      }),
    );

    await this.playlistModel.findByIdAndUpdate(playlistId, {
      status: 'published',
    });

    return playlist;
  }
}
