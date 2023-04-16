import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IParticipation } from '../../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop() title: string;
  @Prop() description: string;
  @Prop() status: 'waiting' | 'completed';
  @Prop() participations: IParticipation[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
