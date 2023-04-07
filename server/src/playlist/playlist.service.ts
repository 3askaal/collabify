import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playlist } from './playlist.schema';
import { IIntel, IPlaylist } from '../../../types/playlist';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name)
    private readonly playlistModel: Model<Playlist>,
  ) {}

  async create(payload: IPlaylist): Promise<any> {
    return this.playlistModel.create(payload);
  }

  async join(
    playlistId: string,
    userId: string,
    data: IIntel['data'],
  ): Promise<any> {
    const newIntel: IIntel = {
      userId,
      data,
      submittedAt: new Date(),
    };

    return this.playlistModel.findByIdAndUpdate(playlistId, {
      $push: { intel: newIntel },
    });
  }
}
