import { groupBy, sampleSize, uniq, shuffle, flatten, orderBy, last, random } from 'lodash';
import slugify from 'slugify';
import {
  IData,
  IMergedParticipationsData,
  IObject,
  IParticipations,
  ITermInstances,
  ITerms,
} from '../../types/playlist';
import SpotifyWebApi from 'spotify-web-api-node';

interface CollectDataRes {
  body: SpotifyApi.UsersTopArtistsResponse | SpotifyApi.UsersTopTracksResponse | SpotifyApi.RecommendationsObject;
}

export const collectData = async (spotifyApi: SpotifyWebApi, debug?: boolean, seed_tracks?: string[]): Promise<IData> =>
  await ['artists', 'tracks'].reduce(async (accumulatorPromise, instance: 'artists' | 'tracks'): Promise<ITerms> => {
    const accumulator = await accumulatorPromise;

    const fetchers: { [key: string]: 'getMyTopArtists' | 'getMyTopTracks' } = {
      artists: 'getMyTopArtists',
      tracks: 'getMyTopTracks',
    };

    const items = await ['short_term', 'medium_term', 'long_term'].reduce(
      async (accumulatorPromise, term: ITermInstances): Promise<ITerms> => {
        const accumulator = await accumulatorPromise;

        const { body }: CollectDataRes = await spotifyApi[(debug ? 'getRecommendations' : fetchers)[instance]](
          debug ? { seed_tracks, limit: 50 } : { time_range: term, limit: 50 },
        );

        let results = 'items' in body ? body.items : body.tracks;

        if (instance === 'artists' && 'tracks' in body) {
          // mapping artists out of tracks because there is no recommendations endpoint for artists
          results = sampleSize(body.tracks.map(({ artists }) => artists as SpotifyApi.ArtistObjectFull[]).flat(), 50);
        }

        const items = results.map(
          (
            result: SpotifyApi.ArtistObjectFull | SpotifyApi.TrackObjectFull | SpotifyApi.RecommendationTrackObject,
            index: number,
          ): IObject => ({
            id: result.uri,
            index,
            name: result.name,
            ...('artists' in result && {
              artist: result.artists.map(({ name }) => name).join(', '),
            }),
            ...('genres' in result && {
              genres: result.genres,
            }),
          }),
        );

        return {
          ...accumulator,
          [term]: items,
        };
      },
      Promise.resolve({ short_term: [], medium_term: [], long_term: [] } as ITerms),
    );

    let genres = {};

    if (instance === 'artists') {
      genres = Object.entries(items).reduce((accumulator, [key, value]: any) => {
        const uniqueGenres: string[] = uniq(flatten(value.map(({ genres }: any) => genres)));
        const genres = uniqueGenres
          // .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
          .map((genre, index) => ({
            id: slugify(genre),
            name: genre,
            index,
          }));

        return {
          ...accumulator,
          [key]: genres,
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

export const mergeParticipationsData = (participations: IParticipations): IMergedParticipationsData => {
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
            .map((items) => {
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

export const getRandomTracksWeightedByRank = async (
  spotifyApi: SpotifyWebApi,
  participations: IParticipations,
  amount: number,
  amountRecommendations?: number,
) => {
  const mergedParticipations = mergeParticipationsData(participations);

  return shuffle(
    flatten(
      await Promise.all(
        participations.map(async ({ user }): Promise<string[]> => {
          const tracksByParticipation = mergedParticipations.tracks.filter(({ occurrences }) => occurrences[user.id]);
          const tracksOrderedByTotalRank = orderBy(tracksByParticipation, ['totalRank'], ['asc']);
          const tracksWithCumulativeTotalRank = tracksOrderedByTotalRank.map(({ id, totalRank }, index) => ({
            id,
            totalRank: index ? tracksOrderedByTotalRank[index - 1].totalRank + totalRank : totalRank,
          }));

          const maxCumulativeTotalRank = last(tracksWithCumulativeTotalRank).totalRank;

          const randomTracks = [];
          let recommendations = [];

          while (randomTracks.length < amount) {
            const randomNumber = random(0, maxCumulativeTotalRank);
            const { id } = tracksWithCumulativeTotalRank.find(({ totalRank }) => totalRank >= randomNumber);

            if (!randomTracks.includes(id)) {
              randomTracks.push(id);
            }
          }

          if (amountRecommendations) {
            const seedTracksForRecommendation = sampleSize(randomTracks).map((id) => id.split(':')[2]);
            recommendations = await getRecommendations(spotifyApi, seedTracksForRecommendation, amountRecommendations);
          }

          return [...randomTracks, ...recommendations];
        }),
      ),
    ),
  );
};

const getRecommendations = async (
  spotifyApi: SpotifyWebApi,
  seedTracksForRecommendation: string[],
  amountRecommendations: number,
) => {
  const { body }: { body: SpotifyApi.RecommendationsObject } = await spotifyApi.getRecommendations({
    seed_tracks: seedTracksForRecommendation,
    limit: 50,
  });

  const tracks = body.tracks.map(({ name, uri, artists }, index: number) => ({
    id: uri,
    index,
    name,
    artist: artists.map(({ name }) => name).join(', '),
  }));

  return sampleSize(
    tracks.map(({ id }) => id),
    amountRecommendations,
  );
};
