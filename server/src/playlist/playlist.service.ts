import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { orderBy, flatten, shuffle } from 'lodash';
import * as SpotifyWebApi from 'spotify-web-api-node';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation } from '../../types/playlist';
import { mergeParticipationsData } from './playlist.helpers';

const getSpotifyInstance = async (refreshToken: string): Promise<SpotifyWebApi> => {
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
  constructor(@InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>) {}

  async getOne(playlistId: string): Promise<Playlist> {
    return this.playlistModel.findById(playlistId);
  }

  async getAll(userId: string, email: string): Promise<Playlist[]> {
    const participated = await this.playlistModel.find({
      'participations.user.id': userId,
    });

    const invited = await this.playlistModel.find({
      invitations: email,
    });

    return [...participated, ...invited];
  }

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

  async participate(playlistId: string, participation: IParticipation): Promise<Playlist> {
    return this.playlistModel.findByIdAndUpdate(playlistId, {
      $push: {
        participations: {
          ...participation,
          submittedAt: new Date(),
        },
      },
    });
  }

  // NOTE: tracks can currently only be added by the creator of the playlist
  // (https://community.spotify.com/t5/Your-Library/API-Playlists-Allow-users-to-add-tracks-to-collaborative/td-p/5334108)
  // when this changes this feature should make every user add their own tracks

  async release(playlistId: string): Promise<any> {
    const playlist: IPlaylist = await this.playlistModel.findById(playlistId);

    const defaultTitle = playlist.participations.map(({ user: { name } }) => name).join(' x ');
    const defaultDescription = 'Generated with https://collabify.vercel.app';
    const hostParticipation: IParticipation = playlist.participations.find(({ user }): boolean => !!user.refreshToken);
    const spotifyApiInstance = await getSpotifyInstance(hostParticipation.user.refreshToken);

    const { id: spotifyPlaylistId } = await spotifyApiInstance
      .createPlaylist(hostParticipation.user.id, {
        name: playlist.title || defaultTitle,
        description: playlist.description || defaultDescription,
        public: false,
      })
      .then(onSuccess, onError);

    const mergedParticipations = mergeParticipationsData(playlist.participations);

    const tracks = shuffle(
      flatten(
        playlist.participations.map(({ user: { id } }) => {
          const tracksByParticipation = mergedParticipations.tracks.filter(({ occurrences }) => occurrences[id]);
          const tracksOrderedByRank = orderBy(tracksByParticipation, ['totalRank'], ['desc']);
          const trackIds = tracksOrderedByRank.map(({ id }) => id);
          return trackIds.slice(0, 20);
        }),
      ),
    );

    await spotifyApiInstance.addTracksToPlaylist(spotifyPlaylistId, tracks).then(onSuccess, onError);

    await this.playlistModel.findByIdAndUpdate(playlistId, {
      status: 'published',
    });

    return playlist;
  }
}
