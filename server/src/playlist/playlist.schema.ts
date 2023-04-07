import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IParticipation } from '../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop() name: string;
  @Prop() description: string;
  @Prop() participations: IParticipation[];
  @Prop() invitations: string[];
  @Prop({ default: 'waiting' }) status: 'waiting' | 'published' | 'active';
  @Prop() shouldUpdate: 'daily' | 'weekly' | 'monthly';
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
