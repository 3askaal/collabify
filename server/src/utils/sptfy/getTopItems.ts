import { AccessToken, Artist, Track } from '@spotify/web-api-ts-sdk';
import to from 'await-to-js';
import slugify from 'slugify';
import { flatten, sampleSize, uniq } from 'lodash';
import { getSpotifyInstanceByAccessToken } from './getInstance';
import { IData, IObject, ITermInstances, ITerms } from '../../../types/playlist';

export const getTopItems = async (accessToken: AccessToken, debug?: boolean, seedTracks?: string[]): Promise<IData> => {
  const sdk = await getSpotifyInstanceByAccessToken(accessToken);

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
