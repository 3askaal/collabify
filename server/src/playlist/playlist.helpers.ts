import { groupBy } from 'lodash';
import { IObject, IParticipations, ITerms } from '../../../types/playlist';

export const simplifyParticipations = (
  participations: IParticipations,
): any => {
  // for each data type (tracks/artists/genres)
  // merge lists with short/medium/long term data
  // into single list with a sum of the ranking
  return participations.map((participation) => {
    return {
      ...participation,
      data: Object.entries(participation.data).reduce(
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
                      // participator: participation.user.id,
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
};
