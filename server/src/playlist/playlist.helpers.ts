import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import to from 'await-to-js';
import { groupBy, sampleSize, orderBy, last, random } from 'lodash';
import { IExcludeData, IMergedParticipationsData, IObject, IParticipations, ITerms } from '../../types/playlist';

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
