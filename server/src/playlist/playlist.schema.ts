import { ObjectType, Field } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IIntel } from '../../../types/playlist';

@Schema()
@ObjectType()
export class Playlist {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String, { description: 'Playlist Title' })
  title: string;

  @Prop()
  @Field(() => String, { description: 'Playlist Description' })
  description: string;

  @Prop()
  @Field(() => [], { description: 'Playlist Data' })
  intel: IIntel[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
