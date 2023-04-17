import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IParticipation } from '../../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop() name: string;
  @Prop() description: string;
  @Prop({ default: 'waiting' }) status: 'waiting' | 'completed';
  @Prop() participations: IParticipation[];
  @Prop() invitations: string[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
