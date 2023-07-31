import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IParticipation, IConfig } from '../../types/playlist';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop() name: string;
  @Prop() description: string;
  @Prop() spotifyId: string;
  @Prop() participations: IParticipation[];
  @Prop() invitations: string[];
  @Prop({ required: true }) size: 's' | 'm' | 'l';
  @Prop({ default: 'waiting' }) status: 'waiting' | 'published';
  @Prop() refreshEvery: 'week' | 'month';
  @Prop() refreshedAt: Date;
  @Prop() publishedAt: Date;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
