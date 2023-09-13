import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { IData, IExcludeData, IParticipation, IPlaylist } from 'types/playlist';
import { getModelToken } from '@nestjs/mongoose';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Playlist } from './playlist.schema';
import { times } from 'lodash';
import { Model } from 'mongoose';
import { PlaylistController } from './playlist.controller';

const getMockedTracks = (amount: number, key = 'track'): any =>
  times(amount, (i) => ({
    [key]: `track_id${i}`,
    index: i,
    name: 'track_name',
    artist: 'artist_name',
  }));

const spotifyMockFunctions = {
  playlists: {
    createPlaylist: async () => ({
      tracks: getMockedTracks(5),
    }),
    getPlaylistItems: async () => ({
      items: getMockedTracks(5),
    }),
    removeItemsFromPlaylist: async () => null,
    addItemsToPlaylist: async () => null,
  },
  currentUser: {
    topItems: async (instance) =>
      instance === 'artists'
        ? {
            items: [{ uri: 'artist_uri', name: 'artist_name', genres: ['genre_1'] }],
          }
        : { items: [{ uri: 'track_uri', name: 'track_name' }] },
  },
  recommendations: {
    get: async () => ({
      tracks: [
        {
          uri: 'track_uri',
          name: 'track_name',
          artists: [{ uri: 'artist_uri', id: 'artist_id', name: 'artist_name', genres: ['genre_1'] }],
        },
      ],
    }),
  },
};

jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue(spotifyMockFunctions as any);

describe('PlaylistService', () => {
  let playlistService: PlaylistService;
  let playlistModel: Model<Playlist>;
  let playlistController: PlaylistController;

  const exampleData: IData = {
    artists: {
      short_term: getMockedTracks(50, 'id'),
      medium_term: getMockedTracks(50, 'id'),
      long_term: getMockedTracks(50, 'id'),
    },
    tracks: {
      short_term: getMockedTracks(50, 'id'),
      medium_term: getMockedTracks(50, 'id'),
      long_term: getMockedTracks(50, 'id'),
    },
    genres: {
      short_term: getMockedTracks(50, 'id'),
      medium_term: getMockedTracks(50, 'id'),
      long_term: getMockedTracks(50, 'id'),
    },
  };

  const exampleExcludeData: IExcludeData = {
    artists: times(5, (i) => `track_id${i}`),
    tracks: times(5, (i) => `track_id${i}`),
    genres: times(5, (i) => `track_id${i}`),
  };

  const exampleParticipation: IParticipation = {
    user: {
      id: '1234567890',
      email: 'johndoe@example.com',
      name: 'John Doe',
      accessToken: {
        access_token: '1234567890',
        token_type: '1234567890',
        expires_in: 1,
        refresh_token: '1234567890',
        expires: 1,
      },
    },
    data: { ...exampleData },
    excludeData: { ...exampleExcludeData },
  };

  const examplePlaylist: IPlaylist = {
    name: 'string',
    description: 'string',
    spotifyId: 'string',
    participations: [exampleParticipation, exampleParticipation],
    invitations: [],
    size: 's',
    status: 'waiting',
    refreshEvery: 'week',
    recommendations: true,
    refreshedAt: new Date(),
    releasedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController],
      providers: [
        PlaylistService,
        {
          provide: getModelToken(Playlist.name),
          useFactory: () => ({
            create: async () => examplePlaylist,
            find: async () => [examplePlaylist],
            findById: async () => examplePlaylist,
            findByIdAndUpdate: async () => examplePlaylist,
          }),
        },
      ],
    }).compile();

    playlistService = module.get<PlaylistService>(PlaylistService);
    playlistController = module.get<PlaylistController>(PlaylistController);
  });

  it('get', async () => {
    const spy = jest.spyOn(playlistService, 'getOne');
    playlistController.get({ id: 'playlist_id' });

    expect(spy).toHaveBeenCalled();
  });

  it('getAll', async () => {
    const spy = jest.spyOn(playlistService, 'getAll');
    playlistController.getAll({ id: 'user_id', email: 'johndoe@example.com' });

    expect(spy).toHaveBeenCalled();
  });

  it('create', async () => {
    const spy = jest.spyOn(playlistService, 'create');
    playlistController.create(examplePlaylist);

    expect(spy).toHaveBeenCalled();
  });

  it('create', async () => {
    const spy = jest.spyOn(playlistService, 'create');
    playlistController.create(examplePlaylist);

    expect(spy).toHaveBeenCalled();
  });

  it('participate', async () => {
    const spy = jest.spyOn(playlistService, 'participate');
    playlistController.participate('playlist_id', examplePlaylist);

    expect(spy).toHaveBeenCalled();
  });

  it('collect', async () => {
    const spy = jest.spyOn(playlistService, 'collect');
    playlistController.collect('playlist_id');

    expect(spy).toHaveBeenCalled();
  });

  it('release', async () => {
    const spy = jest.spyOn(playlistService, 'generate');
    playlistController.release('playlist_id');

    expect(spy).toHaveBeenCalled();
  });

  it('refresh', async () => {
    const spy = jest.spyOn(playlistService, 'generate');
    playlistController.refresh('playlist_id');

    expect(spy).toHaveBeenCalled();
  });

  // getAll
  // create
  // participate
  // collect
  // release
  // refresh
});
