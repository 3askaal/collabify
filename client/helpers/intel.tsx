import { flatten, uniq } from "lodash";
import slugify from "slugify";
import { IPlaylistIntelData, ITerms } from "../../types/playlist";

type Genre = string;

interface Artist {
  uri: string;
  name: string;
}

interface Track {
  uri: string;
  name: string;
  artists: Artist[];
  genres: Genre[];
}

type Object = Genre | Artist | Track;

export const collectIntelData = async (spotifyApi: any): Promise<IPlaylistIntelData> => await ['tracks', 'artists'].reduce(async (accumulatorPromise, instance): Promise<ITerms> => {
  const fetchers: {[key: string]: 'getMyTopArtists' | 'getMyTopTracks'} = {
    artists: 'getMyTopArtists',
    tracks: 'getMyTopTracks',
  }

  const accumulator = await accumulatorPromise

  const items = await ['short_term', 'medium_term', 'long_term'].reduce(async (accumulatorPromise, term: any): Promise<any> => {
    const accumulator = await accumulatorPromise

    const data = await spotifyApi[fetchers[instance]]({ time_range: term, limit: 50 })
    const items = data?.body?.items.map(({ name, uri, artists, genres }: any, index: number) => ({
      id: uri,
      index,
      name,
      include: true,
      ...(instance === 'tracks' && {
        artist: artists.map(({ name }: any) => name).join(', '),
      }),
      ...(instance === 'artists' && {
        genres,
      })
    }))

    return {
      ...accumulator,
      [term]: items
    }
  }, Promise.resolve({ short_term: [], medium_term: [], long_term: [] }) as Promise<IPlaylistIntelData>)

  let genres = {}

  if (instance === 'artists') {
    genres = Object.entries(items).reduce((accumulator, [key, value]: any) => {
      const uniqueGenres: string[] = uniq(flatten(value.map(({ genres }: any) => genres)))
      const filteredGenres = uniqueGenres
        .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
        .map((genre, index) => ({
          id: slugify(genre),
          include: true,
          name: genre,
          index
        }))

      return {
        ...accumulator,
        [key]: filteredGenres
      }
    }, {})
  }

  return {
    ...accumulator,
    [instance]: items,
    ...(instance === 'artists' && {
      genres
    })
  }
}, Promise.resolve({ tracks: {}, artists: {} }) as any)

export const formatIntelData = (data: IPlaylistIntelData) => {

}
