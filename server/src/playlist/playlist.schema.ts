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
  @Prop() size: 's' | 'm' | 'l';
  @Prop() refreshEvery: 'week' | 'month';
  @Prop() recommendations: boolean;
  @Prop({ default: 'waiting' }) status: 'waiting' | 'released';
  @Prop() refreshedAt: Date;
  @Prop() releasedAt: Date;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
