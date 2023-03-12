export interface ITerms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

export interface IData {
  artists?: ITerms;
  tracks?: ITerms;
  genres?: ITerms;
}

export interface IParticipation {
  userId: string;
  data: IData;
  submittedAt?: Date;
}

export type IParticipations = IParticipation[]

export interface IPlaylist {
  id?: string;
  title: string;
  description: string;
  participations: IParticipations;
  status: 'waiting' | 'completed';
}

type IGenre = string;

interface IArtist {
  uri: string;
  name: string;
}

interface ITrack {
  uri: string;
  name: string;
  artists: Artist[];
  genres: Genre[];
  index: number;
}

type IObject = Genre | Artist | Track;
