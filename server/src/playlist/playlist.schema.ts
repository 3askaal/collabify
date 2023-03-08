import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IPlaylistIntel } from '../../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema()
export class Playlist {
  @Prop() title: string;
  @Prop() description: string;
  @Prop() status: 'waiting' | 'completed';
  @Prop() intel: IPlaylistIntel[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
