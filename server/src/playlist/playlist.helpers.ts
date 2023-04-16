import { groupBy } from 'lodash';
import { IObject, IParticipations, ITerms } from '../../../types/playlist';

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
};
