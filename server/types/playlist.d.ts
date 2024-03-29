import { AccessToken } from '@spotify/web-api-ts-sdk';

export interface IConfig {
  name?: string;
  description?: string;
  refreshEvery?: 'week' | 'month';
  size?: 's' | 'm' | 'l';
  recommendations?: boolean;
  invitations?: string[];
}
export interface IUser {
  id: string;
  email: string;
  name: string;
  accessToken?: AccessToken;
  bot?: boolean;
}

type IDataInstances = 'artists' | 'tracks' | 'genres';
type ITermInstances = 'short_term' | 'medium_term' | 'long_term';

export interface ITerms {
  short_term: IObject[];
  medium_term: IObject[];
  long_term: IObject[];
}

export interface IData {
  artists?: ITerms;
  tracks?: ITerms;
  genres?: ITerms;
}

export interface IExcludeData {
  artists?: string[];
  tracks?: string[];
  genres?: string[];
}

export interface IParticipation {
  user: IUser;
  data: IData;
  excludeData?: IExcludeData;
  submittedAt?: Date;
}

export type IParticipations = IParticipation[];

export type IMergedParticipationsData = {
  [Key in keyof IData]: {
    id: string;
    name: string;
    artists?: string[];
    totalRank: number;
    index: number;
    occurrences: {
      [id: string]: {
        periods: ('short' | 'medium' | 'long')[];
        rank: number;
      };
    };
  }[];
};

export interface IPlaylist extends IConfig {
  _id?: string;
  spotifyId?: string;
  participations: IParticipations;
  status: 'waiting' | 'released';
  refreshedAt?: Date;
  releasedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IGenre = string;

export interface IArtist {
  uri: string;
  name: string;
}

export interface ITrack {
  uri: string;
  name: string;
  artists: Artist[];
  genres: Genre[];
  index: number;
}

export type IObject = {
  id: string;
  name?: string;
  artist?: string;
  index?: number;
  rank?: number;
  artists?: string[];
  genres?: string[];
};
