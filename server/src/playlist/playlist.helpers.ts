import { groupBy, sampleSize, uniq, shuffle, flatten, orderBy, times, sample } from 'lodash';
import slugify from 'slugify';
import { IData, IObject, IParticipations, ITerms } from '../../types/playlist';

type SpotifyResBody =
  | SpotifyApi.UsersTopArtistsResponse
  | SpotifyApi.UsersTopTracksResponse
  | SpotifyApi.RecommendationsObject;

export const collectData = async (spotifyApi: any, debug?: boolean, seed_tracks?: string[]): Promise<IData> =>
  await ['artists', 'tracks'].reduce(async (accumulatorPromise, instance): Promise<ITerms> => {
    const fetchers: { [key: string]: 'getMyTopArtists' | 'getMyTopTracks' } = {
      artists: 'getMyTopArtists',
      tracks: 'getMyTopTracks',
    };

    const debugFetchers: { [key: string]: 'getRecommendations' } = {
      artists: 'getRecommendations',
      tracks: 'getRecommendations',
    };

    const accumulator = await accumulatorPromise;

    const items = await ['short_term', 'medium_term', 'long_term'].reduce(
      async (accumulatorPromise, term: any): Promise<any> => {
        const accumulator = await accumulatorPromise;

        const body = await spotifyApi[(debug ? debugFetchers : fetchers)[instance]](
          debug ? { seed_tracks, limit: 50 } : { time_range: term, limit: 50 },
        ).then(
          ({ body }: { body: SpotifyResBody }) => body,
          (err: Error) => {
            throw err;
          },
        );

        let items = [];

        if (debug && instance === 'artists') {
          // mapping artists out of tracks because there is no recommendations endpoint for artists
          items = sampleSize(body.tracks.map(({ artists }: any) => artists).flat(), 50).map(
            ({ name, uri }: any, index: number) => ({ id: uri, index, name }),
          );
        } else {
          items = (debug ? body[instance] : body?.items).map(({ name, uri, artists, genres }: any, index: number) => ({
            id: uri,
            index,
            name,
            include: true,
            ...(instance === 'tracks' && {
              artist: artists.map(({ name }: any) => name).join(', '),
            }),
            ...(instance === 'artists' && {
              genres,
            }),
          }));
        }

        return {
          ...accumulator,
          [term]: items,
        };
      },
      Promise.resolve({ short_term: [], medium_term: [], long_term: [] }) as Promise<IData>,
    );

    let genres = {};

    if (instance === 'artists') {
      genres = Object.entries(items).reduce((accumulator, [key, value]: any) => {
        const uniqueGenres: string[] = uniq(flatten(value.map(({ genres }: any) => genres)));
        const filteredGenres = uniqueGenres
          .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
          .map((genre, index) => ({
            id: slugify(genre),
            include: true,
            name: genre,
            index,
          }));

        return {
          ...accumulator,
          [key]: filteredGenres,
        };
      }, {});
    }

    return {
      ...accumulator,
      [instance]: items,
      ...(instance === 'artists' && {
        genres,
      }),
    };
  }, Promise.resolve({ tracks: {}, artists: {} }) as any);

export const mergeParticipationsData = (participations: IParticipations): any => {
  // merge data of all participants containing genres/artists/tracks
  // with inside containing data from short/medium/long time periods
  // into single collections based on category
  const mergedParticipations = participations.reduce(
    (acc1, participation) => {
      const formattedData = Object.entries(participation.data).reduce((acc2, [key1, value1]: [string, ITerms]) => {
        return {
          ...acc2,
          // transform lists of different time periods
          // into single nested list grouped based on id
          [key1]: Object.values(
            groupBy(
              Object.entries(value1).reduce(
                (accumulator2, [key2, value2]: [string, (IObject & { period: string })[]]) => [
                  ...accumulator2,
                  ...value2.map((item) => ({
                    ...item,
                    // define participator as prop
                    participator: participation.user.id,
                    // define time period as prop
                    period: key2.split('_')[0],
                    // define rank by reversing the index
                    rank: value2.length - item.index,
                  })),
                ],
                [],
              ),
              'id',
            ),
          )
            // merge nested grouped list into single list and merge values
            .map((items: any) => {
              return items.reduce(
                (acc, { period, rank, ...rest }) => {
                  return {
                    ...acc,
                    ...rest,
                    rank: acc.rank + rank,
                    periods: [...acc.periods, period],
                  };
                },
                { periods: [], rank: 0 },
              );
            }),
        };
      }, {});

      // merge formatted participation data with previous ones
      return Object.entries(formattedData).reduce(
        (acc2, [key2, value2]: [string, any[]]) => ({
          ...acc2,
          [key2]: [...acc1[key2], ...value2],
        }),
        {
          artists: [],
          genres: [],
          tracks: [],
        },
      );
    },
    {
      artists: [],
      genres: [],
      tracks: [],
    },
  );

  const mergedData = Object.entries(mergedParticipations).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: Object.values(groupBy(value, 'id')).map((items: any[]) =>
        items.reduce(
          (acc, { participator, periods, rank, ...rest }) => ({
            ...acc,
            ...rest,
            occurrences: {
              ...acc.occurrences,
              [participator]: {
                periods,
                rank,
              },
            },
            totalRank: (acc.totalRank || 0) + rank,
          }),
          {},
        ),
      ),
    }),
    {},
  );

  return mergedData;
};

export const getRandomTracksBasedOnRank = (participations: IParticipations, amount: number) => {
  const mergedParticipations = mergeParticipationsData(participations);

  return shuffle(
    flatten(
      participations.map(({ user: { id } }) => {
        const tracksByParticipation = mergedParticipations.tracks.filter(({ occurrences }) => occurrences[id]);
        const tracksOrderedByRank = orderBy(tracksByParticipation, ['totalRank'], ['desc']);
        const tracksMultipliedByTotalRank = flatten(
          tracksOrderedByRank.map((track) => {
            return times(track.totalRank, () => track);
          }),
        ).map(({ id }) => id);

        const newTracks = [];

        while (newTracks.length < amount) {
          const possibleTrack = sample(tracksMultipliedByTotalRank);

          if (!newTracks.includes(possibleTrack)) {
            newTracks.push(possibleTrack);
          }
        }

        return newTracks;
      }),
    ),
  );
};
