export interface ITerms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

export interface IIntel {
  userId: string;
  data: {
    artists?: Terms;
    tracks?: Terms;
    genres?: Terms;
  };
  submittedAt: Date;
}

export interface IPlaylist {
  id?: string;
  title: string;
  description: string;
  users: Intel[];
}
