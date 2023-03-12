import { IParticipations } from '../../../types/playlist';

export const generateTracklist = (
  participations: IParticipations,
): string[] => {
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
