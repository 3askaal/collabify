import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { IPlaylist } from '../../../types/playlist';
import { Playlist } from './playlist.schema';
import { PlaylistService } from './playlist.service';

@InputType()
export class PlaylistIntel {
  @Field() postId: IPlaylist;
}

@InputType()
export class TermsInputType {
  @Field() short_term: string[];
  @Field() medium_term: string[];
  @Field() long_term: string[];
}

@InputType()
export class IntelDataInputType {
  @Field() artists: TermsInputType;
  @Field() tracks: TermsInputType;
  @Field() genres: TermsInputType;
}

@InputType()
export class IntelInputType {
  @Field() userId: string;
  @Field((_type) => IntelDataInputType) data: IntelDataInputType;
  @Field() submittedAt: Date;
}

@Resolver((of) => Playlist)
export class AuthorsResolver {
  constructor(private playlistService: PlaylistService) {}

  // @Query((returns) => Author)
  // async author(@Args('id', { type: () => Int }) id: number) {
  //   return this.authorsService.findOneById(id);
  // }

  // @ResolveField()
  // async posts(@Parent() author: Author) {
  //   const { id } = author;
  //   return this.postsService.findAll({ authorId: id });
  // }

  @Mutation((returns) => Playlist)
  async join(
    @Args('playlistId') playlistId: string,
    @Args('userId') userId: string,
    @Args('intel') intel: PlaylistIntel,
  ) {
    return this.playlistService.join(payload);
  }
}
