import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { IPlaylist } from '../../types/playlist';
import { Playlist } from './playlist.schema';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async create(@Body() payload: IPlaylist): Promise<Playlist> {
    try {
      return this.playlistService.create(payload);
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  async get(@Param() params): Promise<Playlist> {
    const { id: playlistId } = params;

    try {
      return this.playlistService.get(playlistId);
    } catch (err) {
      throw err;
    }
  }

  @Get('participated/:id')
  async getByUser(@Param() params): Promise<Playlist[]> {
    const { id: userId } = params;

    try {
      return this.playlistService.getParticipated(userId);
    } catch (err) {
      throw err;
    }
  }

  @Put(':id')
  async participate(@Param() params, @Body() payload: IPlaylist): Promise<Playlist> {
    const { id: playlistId } = params;

    try {
      return this.playlistService.participate(playlistId, payload.participations[0]);
    } catch (err) {
      throw err;
    }
  }

  @Get(':id/release')
  async release(@Param() params): Promise<void> {
    const { id: playlistId } = params;

    try {
      return this.playlistService.release(playlistId);
    } catch (err) {
      throw err;
    }
  }
}
