import { groupBy } from 'lodash';
import { IObject, IParticipations, ITerms } from '../../../types/playlist';

export const generateTracklist = (participations: IParticipations): any => {
  // merge data of all participants containing genres/artists/tracks
  // with inside containing data from short/medium/long time periods
  // into single collections based on category
  const mergedParticipations = participations.reduce(
    (acc1, participation) => {
      const formattedData = Object.entries(participation.data).reduce(
        (acc2, [key1, value1]: [string, ITerms]) => {
          return {
            ...acc2,
            // transform lists of different time periods
            // into single nested list grouped based on id
            [key1]: Object.values(
              groupBy(
                Object.entries(value1).reduce(
                  (
                    accumulator2,
                    [key2, value2]: [string, (IObject & { period: string })[]],
                  ) => [
                    ...accumulator2,
                    ...value2.map((item) => ({
                      ...item,
                      // define participator as prop
                      participator: participation.id,
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
        },
        {},
      );

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
            totalRank: acc.totalRank + rank,
          }),
          {},
        ),
      ),
    }),
    {},
  );

  return mergedData;

  // Rate data for each participation individually
  // - Add ranking property (index) to each track in each time period
  // - Combine data from each time period and sum ranking property

  // Rate data based on mutual interest
  // - Combine data from each participation
  //   - mark with boolean when mutual interest
  //   - sum ranking property

  // Generate tracklist based on combination of mutual interest and highest ranked items
};
