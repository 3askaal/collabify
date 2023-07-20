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
import SpotifyWebApi from 'spotify-web-api-node';

interface CollectDataRes {
  body: SpotifyApi.UsersTopArtistsResponse | SpotifyApi.UsersTopTracksResponse | SpotifyApi.RecommendationsObject;
}

export const collectData = async (spotifyApi: SpotifyWebApi, debug?: boolean, seed_tracks?: string[]): Promise<IData> =>
  await ['artists', 'tracks'].reduce(async (accumulatorPromise, instance: 'artists' | 'tracks'): Promise<ITerms> => {
    const accumulator = await accumulatorPromise;

    const fetchers = {
      artists: 'getMyTopArtists',
      tracks: 'getMyTopTracks',
    };

    const items = await ['short_term', 'medium_term', 'long_term'].reduce(
      async (accumulatorPromise, term: ITermInstances): Promise<ITerms> => {
        const accumulator = await accumulatorPromise;

        const { body }: CollectDataRes = await spotifyApi[debug ? 'getRecommendations' : fetchers[instance]](
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
              artists: result.artists.map(({ id }) => id),
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

  const trackExcluded = excludeData?.tracks.includes(item.id);
  const artistExcluded = item.artists?.some((id) => excludeData?.artists.some((xid) => xid === id)) || false;
  const genreExcluded = item.genres?.some((id) => excludeData?.genres.some((xid) => xid === id)) || false;

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
  spotifyApi: SpotifyWebApi,
  seedTracks: string[],
  amountRecommendations: number,
) => {
  const formattedSeedTracks = seedTracks.map((id) => id.split(':')[2]);

  const { body }: { body: SpotifyApi.RecommendationsObject } = await spotifyApi.getRecommendations({
    seed_tracks: formattedSeedTracks,
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
