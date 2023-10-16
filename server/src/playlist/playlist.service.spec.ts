import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { IData, IExcludeData, IParticipation, IPlaylist } from 'types/playlist';
import { getModelToken } from '@nestjs/mongoose';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Playlist } from './playlist.schema';
import { times } from 'lodash';
import { Model } from 'mongoose';

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
        ? { items: [{ uri: 'artist_uri', name: 'artist_name', genres: ['genre_1'] }] }
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

describe('PlaylistService', () => {
  let playlistService: PlaylistService;
  let playlistModel: Model<Playlist>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue(spotifyMockFunctions as any);

    playlistModel = module.get<Model<Playlist>>(getModelToken(Playlist.name));
    playlistService = module.get<PlaylistService>(PlaylistService);
  });

  it('getOne', async () => {
    const received = await playlistService.getOne('id');
    const expected = examplePlaylist;

    expect(received).toEqual(expected);
  });

  it('getAll', async () => {
    const received = await playlistService.getAll('id', 'email');
    const expected = [examplePlaylist, examplePlaylist];

    expect(received).toEqual(expected);
  });

  it('collect', async () => {
    const received = await playlistService.collect({ accessToken: 'id' });
    const expected = {
      tracks: {
        short_term: [{ id: 'track_uri', index: 0, name: 'track_name' }],
        medium_term: [{ id: 'track_uri', index: 0, name: 'track_name' }],
        long_term: [{ id: 'track_uri', index: 0, name: 'track_name' }],
      },
      artists: {
        short_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
        medium_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
        long_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
      },
      genres: {
        short_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
        medium_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
        long_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
      },
    };

    expect(received).toEqual(expected);
  });

  it('collect > debug', async () => {
    const received = await playlistService.collect({ debug: true, seed_tracks: [''], accessToken: 'id' });
    const expected = {
      tracks: {
        short_term: [{ id: 'track_uri', index: 0, name: 'track_name', artist: 'artist_name', artists: ['artist_id'] }],
        medium_term: [{ id: 'track_uri', index: 0, name: 'track_name', artist: 'artist_name', artists: ['artist_id'] }],
        long_term: [{ id: 'track_uri', index: 0, name: 'track_name', artist: 'artist_name', artists: ['artist_id'] }],
      },
      artists: {
        short_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
        medium_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
        long_term: [{ id: 'artist_uri', index: 0, name: 'artist_name', genres: ['genre_1'] }],
      },
      genres: {
        short_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
        medium_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
        long_term: [{ id: 'genre_1', index: 0, name: 'genre_1' }],
      },
    };

    expect(received).toEqual(expected);
  });

  it('collect (fails at topItems)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      currentUser: {
        topItems: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.collect({ accessToken: 'id' })).rejects.toThrowError();
  });

  it('collect > debug (fails at recommendations.get)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      recommendations: {
        get: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.collect({ debug: true, seedTracks: [], accessToken: 'id' })).rejects.toThrowError();
  });

  it('create', async () => {
    const newPlaylist: IPlaylist = {
      name: 'test',
      invitations: [],
      participations: [exampleParticipation, exampleParticipation],
      status: 'waiting',
      size: 's',
      recommendations: true,
    };

    const received = await playlistService.create(newPlaylist);
    const expected = examplePlaylist;

    expect(received).toBe(expected);
  });

  it('participate', async () => {
    const playlist = new Playlist();
    const spy = jest.spyOn(playlistModel, 'findByIdAndUpdate').mockResolvedValue(playlist as Playlist);

    await playlistService.participate('playlist_id', exampleParticipation);

    expect(spy).toHaveBeenCalled();
  });

  it('generate > release', async () => {
    const playlist = new Playlist();
    const spy = jest.spyOn(playlistModel, 'findByIdAndUpdate').mockResolvedValue(playlist as Playlist);

    await playlistService.generate('playlist_id', 'release');

    expect(spy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ status: 'released', releasedAt: expect.anything() }),
      { new: true },
    );
  });

  it('generate > release (fails at createPlaylist)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      playlists: {
        ...spotifyMockFunctions.playlists,
        createPlaylist: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.generate('playlist_id', 'release')).rejects.toThrowError();
  });

  it('generate > release (fails at addItemsToPlaylist)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      playlists: {
        ...spotifyMockFunctions.playlists,
        addItemsToPlaylist: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.generate('playlist_id', 'release')).rejects.toThrowError();
  });

  it('generate > release (fails at recommendations.get)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      recommendations: {
        get: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.generate('playlist_id', 'release')).rejects.toThrowError();
  });

  it('generate > refresh', async () => {
    const playlist = new Playlist();
    const spy = jest.spyOn(playlistModel, 'findByIdAndUpdate').mockResolvedValue(playlist as Playlist);

    await playlistService.generate('playlist_id', 'refresh');

    expect(spy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ participations: expect.anything(), refreshedAt: expect.anything() }),
      { new: true },
    );
  });

  it('generate > refresh (fails at getPlaylistItems)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      playlists: {
        ...spotifyMockFunctions.playlists,
        getPlaylistItems: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.generate('playlist_id', 'refresh')).rejects.toThrowError();
  });

  it('generate > refresh (fails at removeItemsFromPlaylist)', async () => {
    jest.spyOn(SpotifyApi, 'withAccessToken').mockReturnValue({
      ...spotifyMockFunctions,
      playlists: {
        ...spotifyMockFunctions.playlists,
        removeItemsFromPlaylist: async () => {
          throw new Error();
        },
      },
    } as any);

    expect(playlistService.generate('playlist_id', 'refresh')).rejects.toThrowError();
  });

  it('refreshesAt', async () => {
    jest.spyOn(playlistModel, 'find').mockResolvedValue([
      {
        ...examplePlaylist,
        refreshEvery: 'week',
      },
      {
        ...examplePlaylist,
        refreshEvery: 'month',
      },
    ]);

    await playlistService.refreshesAt();
  });
});
