import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { IData, IPlaylist } from '../../types/playlist';
import { Playlist } from './playlist.schema';
import { PlaylistService } from './playlist.service';
import { GetParams, GetAllParams } from './playlist.validators';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get(':id')
  async get(@Param() params: GetParams): Promise<Playlist> {
    const { id: playlistId } = params;

    try {
      return this.playlistService.getOne(playlistId);
    } catch (err) {
      throw err;
    }
  }

  @Post('all')
  async getAll(@Body() payload: GetAllParams): Promise<Playlist[]> {
    const { id: userId, email } = payload;

    try {
      return this.playlistService.getAll(userId, email);
    } catch (err) {
      throw err;
    }
  }

  @Post()
  async create(@Body() payload: IPlaylist): Promise<Playlist> {
    try {
      return this.playlistService.create(payload);
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

  @Post('collect')
  async collect(@Body() payload: any): Promise<IData> {
    // const { id: playlistId } = params;

    try {
      return this.playlistService.collect(payload);
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

  @Get(':id/refresh')
  async update(@Param() params): Promise<void> {
    const { id: playlistId } = params;

    try {
      return this.playlistService.refresh(playlistId);
    } catch (err) {
      throw err;
    }
  }
}
