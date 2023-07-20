import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IParticipation } from '../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop() name: string;
  @Prop() description: string;
  @Prop() spotifyId: string;
  @Prop() participations: IParticipation[];
  @Prop() invitations: string[];
  @Prop({ default: 'waiting' }) status: 'waiting' | 'published';
  @Prop() publishedAt: Date;
  @Prop() refreshEvery: 'week' | 'month';
  @Prop() refreshedAt: Date;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
