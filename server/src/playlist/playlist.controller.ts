import { Controller, Get, Body, Param, Put } from '@nestjs/common';
import { IPlaylist, IPlaylistIntel } from '../../../types/playlist';
import { Playlist } from './playlist.schema';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get()
  async create(@Body() payload: IPlaylist): Promise<Playlist> {
    try {
      return this.playlistService.create(payload);
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  async get(@Param() params): Promise<Playlist> {
    const { playlistId } = params;

    try {
      return this.playlistService.get(playlistId);
    } catch (err) {
      throw err;
    }
  }

  @Put(':id')
  async join(
    @Param() params,
    @Body() payload: IPlaylistIntel,
  ): Promise<Playlist> {
    const { playlistId } = params;

    try {
      return this.playlistService.join(playlistId, payload);
    } catch (err) {
      throw err;
    }
  }
}
