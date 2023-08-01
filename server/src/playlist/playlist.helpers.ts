import { Artist, Page, SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import { groupBy, sampleSize, uniq, flatten, orderBy, last, random } from 'lodash';
import slugify from 'slugify';
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
          const { items: results } = await sdk.currentUser.topItems(instance, term, 49);
          items = results;
        } else {
          // Simulate user activity with recommendations endpoint when debug argument is true
          const { tracks } = await sdk.recommendations.get({ seed_tracks: seedTracks });
          items = tracks;

          // Get artists out of tracks data because there is no recommendations endpoint for artists
          if (instance === 'artists') {
            const debugArtists = sampleSize(tracks.map(({ artists }) => artists).flat(), 50);
            items = debugArtists as Artist[];
          }

          // TODO: Find way to collect genre data
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
          id: slugify(genre || ''),
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
          (acc, { user, periods, rank, ...rest }) => ({
            ...acc,
            ...rest,
            occurrences: {
              ...acc.occurrences,
              [user]: {
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

  return rankedData;
};

const filterItem = (item: IObject, excludeData: IExcludeData) => {
  if (!excludeData) return true;

  const trackExcluded = excludeData?.tracks?.includes(item.id) || false;
  const artistExcluded = item.artists?.some((id) => excludeData?.artists?.some((xid) => xid === id)) || false;
  const genreExcluded = item.genres?.some((id) => excludeData?.genres?.some((xid) => xid === id)) || false;

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

  const { tracks } = await sdk.recommendations.get({
    seed_tracks: formattedSeedTracks,
    limit: 50,
  });

  return sampleSize(
    tracks.map(({ uri }) => uri),
    amountRecommendations,
  );
};
