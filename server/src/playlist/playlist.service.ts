import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model, now } from 'mongoose';
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';
import moment from 'moment';
import { flatten, sampleSize } from 'lodash';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { collectData, getRandomTracksWeightedByRank, getRecommendations } from './playlist.helpers';
import { IPlaylist, IParticipation, IData } from '../../types/playlist';
import { SIZES } from './playlist.constants';

const getSpotifyInstance = async (accessToken: AccessToken): Promise<SpotifyApi> => {
  return SpotifyApi.withAccessToken(process.env.SPOTIFY_API_CLIENT_ID, accessToken);
};

const onSuccess = (data) => {
  return data;
};

const onError = (err) => {
  console.log('ERROR: ', err);
  throw err;
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

  async collect({ debug, seed_tracks, accessToken }: any): Promise<IData> {
    const sdk = await getSpotifyInstance(accessToken);
    return collectData(sdk, debug, seed_tracks);
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
    const hostParticipation: IParticipation = playlist.participations.find(({ user }): boolean => !!user.accessToken);
    const sdk = await getSpotifyInstance(hostParticipation.user.accessToken);

    const { id: spotifyId } = await sdk.playlists.createPlaylist(hostParticipation.user.id, {
      name: playlist.name || defaultTitle,
      description: playlist.description || defaultDescription,
      public: false,
    });

    const tracksPerParticipant = await getRandomTracksWeightedByRank(
      playlist.participations,
      SIZES[playlist.size].tracks,
    );

    const tracklist = flatten(
      await Promise.all(
        tracksPerParticipant.map(async (tracks) => {
          const seedTracks = sampleSize(tracks, 5);
          const recommendations = await getRecommendations(sdk, seedTracks, SIZES[playlist.size].recommendations);
          return [...tracks, ...recommendations];
        }),
      ),
    );

    await sdk.playlists.addItemsToPlaylist(spotifyId, tracklist).then(onSuccess, onError);

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

    return updatedPlaylist;
  }

  async refresh(playlistId: string): Promise<any> {
    const playlist: IPlaylist = await this.playlistModel.findById(playlistId);

    const hostParticipation: IParticipation = playlist.participations.find(({ user }): boolean => !!user.accessToken);
    const sdk = await getSpotifyInstance(hostParticipation.user.accessToken);

    const { items } = await sdk.playlists.getPlaylistItems(playlist.spotifyId).then(onSuccess, onError);
    const tracks = items.map(({ track: { uri } }) => ({ uri }));

    await sdk.playlists.removeItemsFromPlaylist(playlist.spotifyId, tracks).then(onSuccess, onError);

    const newParticipations = await Promise.all(
      playlist.participations.map(async (participation) => ({
        ...participation,
        data: await this.collect({ accessToken: hostParticipation.user.accessToken }),
      })),
    );

    const tracksPerParticipant = await getRandomTracksWeightedByRank(newParticipations, SIZES[playlist.size].tracks);

    const tracklist = flatten(
      await Promise.all(
        tracksPerParticipant.map(async (tracks) => {
          const seedTracks = sampleSize(tracks, 5);
          const recommendations = await getRecommendations(sdk, seedTracks, SIZES[playlist.size].recommendations);
          return [...tracks, ...recommendations];
        }),
      ),
    );

    await sdk.playlists.addItemsToPlaylist(playlist.spotifyId, tracklist).then(onSuccess, onError);

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
