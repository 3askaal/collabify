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
    return this.playlistService.getOne(params.id);
  }

  @Post('all')
  async getAll(@Body() payload: GetAllParams): Promise<Playlist[]> {
    const { id: userId, email } = payload;

    return this.playlistService.getAll(userId, email);
  }

  @Post()
  async create(@Body() payload: IPlaylist): Promise<Playlist> {
    return this.playlistService.create(payload);
  }

  @Put(':id')
  async participate(@Param() params, @Body() payload: IPlaylist): Promise<Playlist> {
    return this.playlistService.participate(params.id, payload.participations[0]);
  }

  @Post('collect')
  async collect(@Body() payload: any): Promise<IData> {
    return this.playlistService.collect(payload);
  }

  @Get(':id/release')
  async release(@Param() params): Promise<Playlist> {
    return this.playlistService.generate(params.id, 'release');
  }

  @Get(':id/refresh')
  async refresh(@Param() params): Promise<Playlist> {
    return this.playlistService.generate(params.id, 'refresh');
  }
}
