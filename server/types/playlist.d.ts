export interface IUser {
  id: string;
  email: string;
  name: string;
  refreshToken?: string;
  bot?: boolean;
}

export interface ITerms {
  short_term: IObject[];
  medium_term: IObject[];
  long_term: IObject[];
}

type IDataInstances = 'artists' | 'tracks' | 'genres';

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

export type IMergedParticipation = {
  [Key in keyof IData]: {
    id: string;
    name: string;
    artist?: string;
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

export interface IPlaylist {
  _id?: string;
  spotifyId?: string;
  title: string;
  description: string;
  participations: IParticipations;
  invitations: string[];
  status: 'waiting' | 'published';
  refreshEvery?: 'week' | 'month';
  publishedAt?: Date;
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
};
