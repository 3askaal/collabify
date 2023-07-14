import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model, now } from 'mongoose';
import moment from 'moment';
import SpotifyWebApi from 'spotify-web-api-node';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation, IData } from '../../types/playlist';
import { collectData, getRandomTracksWeightedByRank } from './playlist.helpers';

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
  console.log('ERROR: ', err);
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

  async collect({ refreshToken, debug, seed_tracks }: any): Promise<IData> {
    const spotifyInstance = await getSpotifyInstance(refreshToken);
    return collectData(spotifyInstance, debug, seed_tracks);
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

    const { id: spotifyId } = await spotifyApiInstance
      .createPlaylist(playlist.title || defaultTitle, {
        description: playlist.description || defaultDescription,
        public: false,
      })
      .then(onSuccess, onError);

    const tracks = await getRandomTracksWeightedByRank(spotifyApiInstance, playlist.participations, 20, 10);

    await spotifyApiInstance.addTracksToPlaylist(spotifyId, tracks).then(onSuccess, onError);

    await this.playlistModel.findByIdAndUpdate(playlistId, {
      status: 'published',
      publishedAt: Date.now(),
      spotifyId,
    });

    return playlist;
  }

  async refresh(playlistId: string): Promise<any> {
    const playlist: IPlaylist = await this.playlistModel.findById(playlistId);

    const hostParticipation: IParticipation = playlist.participations.find(({ user }): boolean => !!user.refreshToken);
    const spotifyApiInstance = await getSpotifyInstance(hostParticipation.user.refreshToken);

    const { items } = await spotifyApiInstance.getPlaylistTracks(playlist.spotifyId).then(onSuccess, onError);
    const tracks = items.map(({ track: { uri } }) => ({ uri }));

    await spotifyApiInstance.removeTracksFromPlaylist(playlist.spotifyId, tracks).then(onSuccess, onError);

    const newParticipations = await Promise.all(
      playlist.participations.map(async (participation) => ({
        ...participation,
        data: await this.collect({ refreshToken: hostParticipation.user.refreshToken }),
      })),
    );

    const newTracks = await getRandomTracksWeightedByRank(spotifyApiInstance, newParticipations, 20, 10);

    await spotifyApiInstance.addTracksToPlaylist(playlist.spotifyId, newTracks).then(onSuccess, onError);

    await this.playlistModel.findByIdAndUpdate(playlistId, {
      participations: newParticipations,
      refreshedAt: now(),
    });

    return playlist;
  }

  @Cron('0 0 * * *') // every day at 00:00
  async refreshesAt(): Promise<void> {
    const playlists: IPlaylist[] = await this.playlistModel.find({
      refreshEvery: { $exists: true },
    });

    playlists.forEach((playlist) => {
      if (playlist.refreshEvery === 'week') {
        const dayOfTheWeek = moment(playlist.publishedAt).day();

        if (moment().day() === dayOfTheWeek) {
          this.refresh(playlist._id);
        }
      }

      if (playlist.refreshEvery === 'month') {
        const dayOfTheMonth = moment(playlist.publishedAt).date();

        if (moment().date() === dayOfTheMonth) {
          this.refresh(playlist._id);
        }
      }
    });
  }
}
