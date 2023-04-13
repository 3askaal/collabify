import { orderBy } from 'lodash';
import { IParticipations } from '../../../types/playlist';

export const generateTracklist = (
  participations: IParticipations,
): IParticipations => {
  const rankedParticipations = participations.map((participation) => {
    return {
      ...participation,
      data: Object.entries(participation.data).reduce(
        (accumulator1, [key1, value1]: any) => {
          return {
            ...accumulator1,
            [key1]: Object.entries(value1).reduce(
              (accumulator2, [key2, value2]: any, index, items) => {
                return {
                  ...accumulator2,
                  [key2]: orderBy(
                    value2.map(({ id, name }: any) => {
                      const rankBasedOnAppearance = items
                        .map(([, value]) => value)
                        .flat()
                        .filter(({ id: objectId }) => objectId === id)
                        .map(({ index }) => value2.length - index)
                        .reduce((sum, a) => sum + a, 0);

                      return {
                        id,
                        rank: rankBasedOnAppearance,
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
