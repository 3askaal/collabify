export interface ITerms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

export interface IPlaylistIntel {
  userId: string;
  data: {
    artists?: ITerms;
    tracks?: ITerms;
    genres?: ITerms;
  };
  submittedAt?: Date;
}

export interface IPlaylist {
  id?: string;
  title: string;
  description: string;
  users: IPlaylistIntel[];
}
