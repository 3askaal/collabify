import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation } from '../../../types/playlist';
import { generateTracklist } from './playlist.helpers';

const spotifyApi: any = new SpotifyWebApi({
  clientSecret: process.env.SPOTIFY_API_SECRET_ID,
});

const refreshAccessToken = (refreshToken) => {
  return axios
    .post(`${process.env.PROD_URL}/api/refresh`, { refreshToken })
    .then((res) => {
      return res.data.accessToken;
    })
    .catch((err) => {
      (window as any).location = '/';
      console.log('ERR: ', err);
      // history.push('/')
    });
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

    const formattedParticipations = playlist.participations.map(
      (item, index) => ({ ...item, id: index }),
    );

    const tracklist = generateTracklist(formattedParticipations);

    const { id: spotifyPlaylistId } = await spotifyApi.createPlaylist(
      playlist.title,
      {
        description: playlist.description,
        public: false,
      },
    );

    await Promise.all(
      formattedParticipations.map(({ refreshToken, tracks }: any) => {
        const accessToken = refreshAccessToken(refreshToken);
        spotifyApi.setAccessToken(accessToken);

        return spotifyApi.addTracksToPlaylist(spotifyPlaylistId, tracks).then(
          (data) => {
            // add tracks to playlist success
          },
          (err) => {
            // add tracks to playlist fail
          },
        );
      }),
    );

    return tracklist;
  }
}
