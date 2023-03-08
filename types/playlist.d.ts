export interface ITerms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

export interface IPlaylistIntelData {
  artists?: ITerms;
  tracks?: ITerms;
  genres?: ITerms;
}

export interface IPlaylistIntel {
  userId: string;
  data: IPlaylistIntelData;
  submittedAt?: Date;
}

export interface IPlaylist {
  id?: string;
  title: string;
  description: string;
  intel: IPlaylistIntel[];
}
