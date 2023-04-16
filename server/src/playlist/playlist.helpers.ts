import { orderBy } from 'lodash';
import {
  IObject,
  IParticipation,
  IParticipations,
  ITerms,
} from '../../../types/playlist';

// Add ranking property to collection objects by reversing the index
const defineRankingProperties = (collection: any[]): any[] => {
  return collection.map((item) => ({
    ...item,
    rank: collection.length - item.index,
  }));
};

// Define object ranking in other collections
const calculateRankBasedOnSharedInterest = (
  objectId: string,
  type: string,
  participation: IParticipation,
): number => {
  return Object.values(participation.data[type])
    .map((collection: any) => defineRankingProperties(collection))
    .flat()
    .filter(({ id }: any) => objectId === id)
    .map(({ rank }) => rank)
    .reduce((sum, a) => sum + a, 0);
};

export const generateTracklist = (
  participations: IParticipations,
): IParticipations => {
  const rankedParticipations = participations.map((participation) => {
    // for each participant
    return {
      ...participation,
      data: Object.entries(participation.data).reduce(
        (accumulator1, [key1, value1]: [string, ITerms]) => {
          // for each type of data (genres/artists/tracks)
          return {
            ...accumulator1,
            [key1]: Object.entries(value1).reduce(
              (
                accumulator2,
                [key2, value2]: [string, IObject[]],
                index,
                items,
              ) => {
                // for each type of period (short/medium/long)
                return {
                  ...accumulator2,
                  [key2]: orderBy(
                    value2.map(({ id, name }: any) => {
                      console.log(name);
                      // rank items based on occurrences accross all period types
                      const rankingOverTime = items
                        // make unified collection over all time periods
                        .map(([, value]) => value)
                        .map((collection: any) =>
                          defineRankingProperties(collection),
                        )
                        .flat()
                        // find identical objects in unified collection
                        .filter(({ id: objectId }) => objectId === id)
                        // map ranking value
                        .map(({ rank }) => rank)
                        // sum ranking value
                        .reduce((sum, a) => sum + a, 0);

                      // rank items based on occurrences in other participants data
                      const rankBasedOnSharedInterest = participations
                        .filter(
                          ({ id: participationId }): boolean =>
                            participationId !== participation.id,
                        )
                        .map((participation) =>
                          calculateRankBasedOnSharedInterest(
                            id,
                            key1,
                            participation,
                          ),
                        )
                        .reduce((sum, a) => sum + a, 0);

                      console.log('rankingOverTime: ', rankingOverTime); // eslint-disable-line
                      console.log('rankBasedOnSharedInterest: ', rankBasedOnSharedInterest); // eslint-disable-line

                      return {
                        id,
                        rank: rankingOverTime + rankBasedOnSharedInterest,
                        name,
                      };
                    }),
                    ['rank'],
                    ['desc'],
                  ),
                };
              },
              {},
            ),
          };
        },
        {},
      ),
    };
  });

  return rankedParticipations;
  // Rate data for each participation individually
  // - Add ranking property (index) to each track in each time period
  // - Combine data from each time period and sum ranking property

  // Rate data based on mutual interest
  // - Combine data from each participation
  //   - mark with boolean when mutual interest
  //   - sum ranking property

  // Generate tracklist based on combination of mutual interest and highest ranked items

  return [];
};
