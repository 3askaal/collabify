import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model, now } from 'mongoose';
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';
import moment from 'moment';
import { flatten, sampleSize, shuffle } from 'lodash';
import to from 'await-to-js';

import { Playlist, PlaylistDocument } from './playlist.schema';
import { collectData, getRandomTracksWeightedByRank, getRecommendations } from './playlist.helpers';
import { IPlaylist, IParticipation, IData } from '../../types/playlist';
import { SIZES } from './playlist.constants';

const getSpotifyInstance = async (accessToken: AccessToken): Promise<SpotifyApi> => {
  return SpotifyApi.withAccessToken(process.env.SPOTIFY_API_CLIENT_ID, accessToken);
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
    return this.playlistModel.create({
      ...payload,
      participations: payload.participations.map((participation) => ({
        ...participation,
        submittedAt: new Date(),
      })),
    });
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

  async generate(playlistId: string, type: 'release' | 'refresh'): Promise<any> {
    const playlist: IPlaylist = await this.playlistModel.findById(playlistId);
    const hostParticipation: IParticipation = playlist.participations.find(({ user }): boolean => !!user.accessToken);
    const sdk = await getSpotifyInstance(hostParticipation.user.accessToken);

    let spotifyId: string;

    if (type === 'release') {
      const defaultTitle = playlist.participations.map(({ user: { name } }) => name).join(' x ');
      const defaultDescription = 'Generated with https://collabify.vercel.app';

      const [createPlaylistErr, createPlaylistSuccess] = await to(
        sdk.playlists.createPlaylist(hostParticipation.user.id, {
          name: playlist.name || defaultTitle,
          description: playlist.description || defaultDescription,
          public: false,
        }),
      );

      if (createPlaylistErr) {
        throw createPlaylistErr;
      }

      spotifyId = createPlaylistSuccess.id;
    }

    if (type === 'refresh') {
      const [getPlaylistItemsErr, getPlaylistItemsSuccess] = await to(
        sdk.playlists.getPlaylistItems(playlist.spotifyId),
      );

      if (getPlaylistItemsErr) {
        throw getPlaylistItemsErr;
      }

      const tracks = getPlaylistItemsSuccess.items.map(({ track: { uri } }) => ({ uri }));

      const [removeItemsFromPlaylistErr] = await to(
        sdk.playlists.removeItemsFromPlaylist(playlist.spotifyId, { tracks }),
      );

      if (removeItemsFromPlaylistErr) {
        throw removeItemsFromPlaylistErr;
      }

      const newParticipations = await Promise.all(
        playlist.participations.map(async (participation) => ({
          ...participation,
          data: await this.collect({ accessToken: hostParticipation.user.accessToken }),
        })),
      );

      playlist.participations = newParticipations;
    }

    const tracksPerParticipant = await getRandomTracksWeightedByRank(
      playlist.participations,
      SIZES[playlist.size].tracks,
    );

    let recommendations: string[] = [];

    if (playlist.recommendations) {
      recommendations = flatten(
        await Promise.all(
          tracksPerParticipant.map(async (tracks) => {
            const seedTracks = sampleSize(tracks, 5);
            const recommendations = await getRecommendations(sdk, seedTracks, SIZES[playlist.size].recommendations);
            return recommendations;
          }),
        ),
      );
    }

    const tracklist = shuffle(flatten([...tracksPerParticipant, recommendations]));

    const [addItemsToPlaylistErr] = await to(
      sdk.playlists.addItemsToPlaylist(spotifyId || playlist.spotifyId, tracklist),
    );

    if (addItemsToPlaylistErr) {
      throw addItemsToPlaylistErr;
    }

    const updatedPlaylist = await this.playlistModel.findByIdAndUpdate(
      playlist._id,
      {
        ...(type === 'release' && {
          status: 'released',
          releasedAt: now(),
          spotifyId: spotifyId,
        }),
        ...(type === 'refresh' && {
          participations: playlist.participations,
          refreshedAt: now(),
        }),
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
        const releasedDay = moment(playlist.releasedAt).day();

        if (todaysDay === releasedDay) {
          this.generate(playlist._id, 'refresh');
        }
      }

      if (playlist.refreshEvery === 'month') {
        const todaysDate = moment().date();
        const releasedDate = moment(playlist.releasedAt).date();
        const lastDateOfTheMonth = moment().endOf('month').date();

        const todaysMonth = moment().month();
        const refreshedMonth = moment(playlist.refreshedAt).month();

        if (todaysDate === releasedDate || (releasedDate === lastDateOfTheMonth && refreshedMonth !== todaysMonth)) {
          this.generate(playlist._id, 'refresh');
        }
      }
    });
  }
}
