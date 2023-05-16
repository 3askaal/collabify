import { flatten, sampleSize, uniq } from "lodash";
import slugify from "slugify";
import { IData, ITerms } from "../../server/types/playlist";

type SpotifyResBody = SpotifyApi.UsersTopArtistsResponse | SpotifyApi.UsersTopTracksResponse | SpotifyApi.RecommendationsObject

export const collectData = async (spotifyApi: any, debug?: boolean, seed_tracks?: string[]): Promise<IData> => await ['artists', 'tracks'].reduce(async (accumulatorPromise, instance): Promise<ITerms> => {
  const fetchers: {[key: string]: 'getMyTopArtists' | 'getMyTopTracks'} = {
    artists: 'getMyTopArtists',
    tracks: 'getMyTopTracks',
  }

  const debugFetchers: {[key: string]: 'getRecommendations'} = {
    artists: 'getRecommendations',
    tracks: 'getRecommendations',
  }

  const accumulator = await accumulatorPromise

  const items = await ['short_term', 'medium_term', 'long_term'].reduce(async (accumulatorPromise, term: any): Promise<any> => {
    const accumulator = await accumulatorPromise

    const body = await (spotifyApi[((debug ? debugFetchers : fetchers)[instance])])(debug ? { seed_tracks, limit: 50 } : { time_range: term, limit: 50 })
      .then(
        ({ body }: { body: SpotifyResBody }) => body,
        (err: Error) => { throw err }
      )

    let items = []

    if (debug && instance === 'artists') {
      // mapping artists out of tracks because there is no recommendations endpoint for artists
      items = sampleSize(
        body.tracks.map(({ artists }: any) => artists).flat(),
        50
      ).map(({ name, uri }: any, index: number) => ({ id: uri, index, name }));

    } else {
      items = (debug ? body[instance] : body?.items).map(({ name, uri, artists, genres }: any, index: number) => ({
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
    }

    return {
      ...accumulator,
      [term]: items
    }
  }, Promise.resolve({ short_term: [], medium_term: [], long_term: [] }) as Promise<IData>)

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

export const formatData = (data: IData) => {
  return Object.entries(data).reduce((accumulator1, [key1, value1]: any) => {
    return {
      ...accumulator1,
      [key1]: Object.entries(value1).reduce((accumulator2, [key2, value2]: any) => {
        return {
          ...accumulator2,
          [key2]: value2.map(({ id, index }: any) => ({
            id,
            index: index + 1
          }))
        }
      }, {})
    }
  }, {})
}
