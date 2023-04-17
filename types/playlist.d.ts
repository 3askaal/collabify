export interface IUser {
  id: string;
  email: string;
  name: string;
  refreshToken: string;
}

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

export interface IParticipation {
  id?: number;
  user: IUser;
  data: IData;
  submittedAt?: Date;
}

export type IParticipations = IParticipation[]

export interface IPlaylist {
  _id?: string;
  title: string;
  description: string;
  participations: IParticipations;
  invitations: string[];
  status: 'waiting' | 'completed';
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
  include?: boolean;
}
