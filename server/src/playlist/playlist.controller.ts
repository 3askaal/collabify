import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { IPlaylist } from '../../../types/playlist';
import { Playlist } from './playlist.schema';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async create(@Body() payload: IPlaylist): Promise<Playlist> {
    console.log('##### CREATE #####');
    console.log('payload: ', payload);

    try {
      return this.playlistService.create(payload);
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  async get(@Param() params): Promise<Playlist> {
    console.log('##### GET #####');
    console.log('params.id: ', params.id);

    const { id: playlistId } = params;

    try {
      return this.playlistService.get(playlistId);
    } catch (err) {
      throw err;
    }
  }

  @Put(':id')
  async participate(
    @Param() params,
    @Body() payload: IPlaylist,
  ): Promise<Playlist> {
    console.log('##### PARTICIPATE #####');
    console.log('params.id: ', params.id);
    console.log('payload: ', payload);

    const { id: playlistId } = params;

    try {
      return this.playlistService.participate(
        playlistId,
        payload.participations[0],
      );
    } catch (err) {
      throw err;
    }
  }

  @Get(':id/release')
  async release(@Param() params): Promise<void> {
    console.log('##### RELEASE #####');
    console.log('params.id: ', params.id);

    const { id: playlistId } = params;

    try {
      return this.playlistService.release(playlistId);
    } catch (err) {
      throw err;
    }
  }
}
