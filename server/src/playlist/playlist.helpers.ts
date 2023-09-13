import { Artist, SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import { groupBy, sampleSize, uniq, flatten, orderBy, last, random } from 'lodash';
import slugify from 'slugify';
import to from 'await-to-js';
import {
  IData,
  IExcludeData,
  IMergedParticipationsData,
  IObject,
  IParticipations,
  ITermInstances,
  ITerms,
} from '../../types/playlist';

export const collectData = async (sdk: SpotifyApi, debug?: boolean, seedTracks?: string[]): Promise<IData> => {
  return ['artists', 'tracks'].reduce(async (accumulatorPromise, instance: 'artists' | 'tracks'): Promise<ITerms> => {
    const accumulator = await accumulatorPromise;

    const items = await ['short_term', 'medium_term', 'long_term'].reduce(
      async (accumulatorPromise, term: ITermInstances): Promise<ITerms> => {
        const accumulator = await accumulatorPromise;

        let items: (Track | Artist)[] = [];

        if (!debug) {
          const [getTopItemsErr, getTopItemsSuccess] = await to(sdk.currentUser.topItems(instance, term, 49));

          if (getTopItemsErr) {
            throw getTopItemsErr;
          }

          items = getTopItemsSuccess.items;
        } else {
          // Simulate user activity with recommendations endpoint when debug argument is true
          const [getRecommendationsErr, getRecommendationsSuccess] = await to(
            sdk.recommendations.get({ seed_tracks: seedTracks }),
          );

          if (getRecommendationsErr) {
            throw getRecommendationsErr;
          }

          items = getRecommendationsSuccess.tracks;

          // Get artists out of tracks data because there is no recommendations endpoint for artists
          if (instance === 'artists') {
            const debugArtists = sampleSize(getRecommendationsSuccess.tracks.map(({ artists }) => artists).flat(), 50);
            items = debugArtists as Artist[];
          }
        }

        const formattedItems = items.map(
          (item, index: number): IObject => ({
            id: item.uri,
            index,
            name: item.name,
            ...('artists' in item && {
              artist: item.artists.map(({ name }) => name).join(', '),
              artists: item.artists.map(({ id }) => id),
            }),
            ...('genres' in item && {
              genres: item.genres,
            }),
          }),
        );

        return {
          ...accumulator,
          [term]: formattedItems,
        };
      },
      Promise.resolve({ short_term: [], medium_term: [], long_term: [] } as ITerms),
    );

    let genres = {};

    if (instance === 'artists') {
      genres = Object.entries(items).reduce((accumulator, [key, value]: any) => {
        const uniqueGenres: string[] = uniq(flatten(value.map(({ genres }: any) => genres)));
        const genres = uniqueGenres.map((genre, index) => ({
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
};

const rankData = (participations: IParticipations): IMergedParticipationsData => {
  const mergedData = participations.reduce((acc1, { data, excludeData, user: { id: userId } }) => {
    const mergedPeriods = Object.entries(data).reduce((acc1, [type, typeData]: [string, ITerms]) => {
      return {
        ...acc1,
        [type]: Object.entries(typeData).reduce(
          (acc2, [term, termData]: [string, (IObject & { period: string })[]]) => [
            ...acc2,
            ...termData
              .filter((item) => filterItem(item, excludeData))
              .map(({ id, index }) => ({
                id,
                user: userId,
                period: term.split('_')[0],
                rank: termData.length - index,
              })),
          ],
          [],
        ),
      };
    }, []);

    return Object.entries(mergedPeriods).reduce(
      (acc2, [key2, value2]: [string, any[]]) => ({
        ...acc2,
        [key2]: [...(acc1[key2] || []), ...value2],
      }),
      {},
    );
  }, {});

  const rankedData = Object.entries(mergedData).reduce(
    (acc, [key, value]: any) => ({
      ...acc,
      [key]: Object.values(groupBy(value, 'id')).map((items: any[]) =>
        items.reduce(
          (acc, { user, period, rank, ...rest }) => ({
            ...acc,
            ...rest,
            occurrences: {
              ...acc.occurrences,
              [user]: {
                // TODO: transform into array instead of overwriting last value in loop
                period,
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

  return rankedData;
};

const filterItem = (item: IObject, excludeData: IExcludeData) => {
  if (!excludeData) return true;

  const trackExcluded = excludeData.tracks?.includes(item.id) || false;
  const artistExcluded = item.artists?.some((id) => excludeData.artists?.some((xid) => xid === id)) || false;
  const genreExcluded = item.genres?.some((id) => excludeData.genres?.some((xid) => xid === id)) || false;

  return !(trackExcluded || artistExcluded || genreExcluded);
};

export const getRandomTracksWeightedByRank = async (participations: IParticipations, amount: number) => {
  const rankedData = rankData(participations);

  return Promise.all(
    participations.map(async ({ user }): Promise<string[]> => {
      const tracksByParticipation = rankedData.tracks.filter(({ occurrences }) => occurrences[user.id]);
      const tracksOrderedByTotalRank = orderBy(tracksByParticipation, ['totalRank'], ['asc']);
      const tracksWithCumulativeTotalRank = tracksOrderedByTotalRank.map(({ id, totalRank }, index) => ({
        id,
        totalRank: index ? tracksOrderedByTotalRank[index - 1].totalRank + totalRank : totalRank,
      }));

      if (tracksWithCumulativeTotalRank.length <= amount) {
        return tracksWithCumulativeTotalRank.map(({ id }) => id);
      }

      const maxCumulativeTotalRank = last(tracksWithCumulativeTotalRank).totalRank;
      const randomTracks = [];

      while (randomTracks.length < amount) {
        const randomNumber = random(0, maxCumulativeTotalRank);
        const { id } = tracksWithCumulativeTotalRank.find(({ totalRank }) => totalRank >= randomNumber);

        if (!randomTracks.includes(id)) {
          randomTracks.push(id);
        }
      }

      return randomTracks;
    }),
  );
};

export const getRecommendations = async (
  sdk: SpotifyApi,
  seedTracks: string[],
  amountRecommendations: number,
): Promise<string[]> => {
  const formattedSeedTracks = seedTracks.map((id) => id.split(':')[2]);

  const [getRecommendationsErr, getRecommendationsSuccess] = await to(
    sdk.recommendations.get({
      seed_tracks: formattedSeedTracks,
      limit: 50,
    }),
  );

  if (getRecommendationsErr) {
    throw getRecommendationsErr;
  }

  return sampleSize(
    getRecommendationsSuccess.tracks.map(({ uri }) => uri),
    amountRecommendations,
  );
};
