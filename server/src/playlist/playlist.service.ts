import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model, now } from 'mongoose';
import moment from 'moment';
import SpotifyWebApi from 'spotify-web-api-node';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation, IData } from '../../types/playlist';
import { collectData, getRandomTracksWeightedByRank, getRecommendations } from './playlist.helpers';
import { flatten, sampleSize } from 'lodash';

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
    return this.playlistModel.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          participations: {
            ...participation,
            submittedAt: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );
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

    const tracksPerParticipant = await getRandomTracksWeightedByRank(playlist.participations, 20);

    const tracklist = flatten(
      await Promise.all(
        tracksPerParticipant.map(async (tracks) => {
          const recommendations = await getRecommendations(spotifyApiInstance, sampleSize(tracks, 5), 10);
          return [...tracks, ...recommendations];
        }),
      ),
    );

    await spotifyApiInstance.addTracksToPlaylist(spotifyId, tracklist).then(onSuccess, onError);

    const updatedPlaylist = await this.playlistModel.findByIdAndUpdate(
      playlistId,
      {
        status: 'published',
        publishedAt: Date.now(),
        spotifyId,
      },
      {
        new: true,
      },
    );

    const { body } = await spotifyApiInstance.getPlaylist(spotifyId);

    console.log('body: ', body); // eslint-disable-line

    return updatedPlaylist;
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

    const tracksPerParticipant = await getRandomTracksWeightedByRank(newParticipations, 20);

    const tracklist = flatten(
      await Promise.all(
        tracksPerParticipant.map(async (tracks) => {
          const recommendations = await getRecommendations(spotifyApiInstance, sampleSize(tracks, 5), 10);
          return [...tracks, ...recommendations];
        }),
      ),
    );

    await spotifyApiInstance.addTracksToPlaylist(playlist.spotifyId, tracklist).then(onSuccess, onError);

    const updatedPlaylist = await this.playlistModel.findByIdAndUpdate(
      playlistId,
      {
        participations: newParticipations,
        refreshedAt: now(),
      },
      {
        new: true,
      },
    );

    const { body } = await spotifyApiInstance.getPlaylist(playlist.spotifyId);

    console.log('body: ', body); // eslint-disable-line

    return updatedPlaylist;
  }

  @Cron('0 0 * * *') // every day at 00:00
  async refreshesAt(): Promise<void> {
    const playlists: IPlaylist[] = await this.playlistModel.find({
      refreshEvery: { $exists: true },
    });

    playlists.forEach(async (playlist) => {
      if (playlist.refreshEvery === 'week') {
        const todaysDay = moment().day();
        const publishedDay = moment(playlist.publishedAt).day();

        if (todaysDay === publishedDay) {
          this.refresh(playlist._id);
        }
      }

      if (playlist.refreshEvery === 'month') {
        const todaysDate = moment().date();
        const publishedDate = moment(playlist.publishedAt).date();
        const lastDateOfTheMonth = moment().endOf('month').date();

        const todaysMonth = moment().month();
        const refreshedMonth = moment(playlist.refreshedAt).month();

        if (todaysDate === publishedDate || (publishedDate === lastDateOfTheMonth && refreshedMonth !== todaysMonth)) {
          this.refresh(playlist._id);
        }
      }
    });
  }
}
