import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playlist, PlaylistDocument } from './playlist.schema';
import { IPlaylist, IParticipation } from '../../../types/playlist';
import { generateTracklist } from './playlist.helpers';

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

    // Create a playlist
    // const playlist = await spotifyApi
    //   .createPlaylist('My playlist', {
    //     description: 'this playlist is generated with collabify',
    //     public: true,
    //   })

    // // Add tracks to a playlist
    // spotifyApi
    //   .addTracksToPlaylist('5ieJqeLJjjI8iJWaxeBLuK', [
    //     'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
    //     'spotify:track:1301WleyT98MSxVHPZCA6M',
    //   ])
    //   .then(
    //     function (data) {
    //       console.log('Added tracks to playlist!');
    //     },
    //     function (err) {
    //       console.log('Something went wrong!', err);
    //     },
    //   );

    return tracklist;
  }
}
