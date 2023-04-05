import { useEffect, useRef, useState } from 'react'
import { Spacer, Box, Container, Wrapper, ElementGroup, Button } from '3oilerplate'
import { orderBy, remove, startCase } from 'lodash'
import useSpotifyApi from '../hooks/useSpotifyApi'
import SelectionLabel from './selectionLabel'

type DataTypes = 'artists' | 'tracks' | 'genres';
type TermTypes = 'short_term' | 'medium_term' | 'long_term';

interface Terms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

interface Intel {
  artists?: Terms;
  tracks?: Terms;
  genres?: Terms;
}

export default function CollectIntelAuthenticated() {
  const { spotifyApi, accessToken } = useSpotifyApi()

  const [activeTab, setActiveTab] = useState<string>('artists')
  const [activeTerm, setActiveTerm] = useState<{ artists: TermTypes, tracks: TermTypes, genres: TermTypes }>({ artists: 'short_term', tracks: 'short_term', genres: 'short_term' })

  const [intel, setIntel] = useState<Intel>({
    artists: { short_term: [], medium_term: [], long_term: [] },
    tracks: { short_term: [], medium_term: [], long_term: [] },
    genres: { short_term: [], medium_term: [], long_term: [] },
  })

  // const topGenres = (term: TermTypes) => intel.genres
  const topTracks = intel.tracks ? intel.tracks[activeTerm.tracks] : []
  const topArtists = intel.artists ? intel.artists[activeTerm.artists] : []
  const topGenres = intel.genres ? intel.genres[activeTerm.genres] : []

  const fetchers: {[key: string]: 'getMyTopArtists' | 'getMyTopTracks'} = {
    artists: 'getMyTopArtists',
    tracks: 'getMyTopTracks',
  }

  useEffect(() => {
    if (!spotifyApi) return

    const collectData = async () => await ['tracks', 'artists'].reduce(async (accumulatorPromise, instance): Promise<any> => {
      const accumulator = await accumulatorPromise

      const items = await ['short_term', 'medium_term', 'long_term'].reduce(async (accumulatorPromise, term: any): Promise<any> => {
        const accumulator = await accumulatorPromise

        const data = await spotifyApi[fetchers[instance]]({ time_range: term, limit: 50 })
        const items = data?.body?.items.map(({ name, uri, artists }: any, index: number) => ({
          id: uri,
          index,
          name,
          selected: true,
          ...(instance === 'tracks' && {
            artist: artists.map(({ name }: any) => name).join(', '),
          })
        }))

        return {
          ...accumulator,
          [term]: items
        }
      }, Promise.resolve({ short_term: [], medium_term: [], long_term: [] }) as any)

      // // includes alot of subgenres
      // const uniqueGenres: string[] = uniq(flatten(items.map(({ genres }: any) => genres)))

      // // filter out subgenres
      // const mainGenres = uniqueGenres
      //   .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
      //   .map((genre) => ({
      //     id: slugify(genre),
      //     selected: true,
      //     name: genre,
      //   }))

      return {
        ...accumulator,
        [instance]: items,
        ...(instance === 'tracks' && {
          // genres:
        })
      }
    }, Promise.resolve({ tracks: {}, artists: {} }) as any)

    collectData().then((data) => {
      setIntel(data)
    })

    // spotifyApi.getMyTopArtists({ time_range: 'medium_term', limit: 50 })
    //   .then((data: any) => {
    //     const artists = data?.body?.items.map(({ name, uri }: any, index: number) => ({
    //       id: uri,
    //       index,
    //       name,
    //       selected: true
    //     }))
    //     setTopArtists(artists)

    //     // includes alot of subgenres
    //     const uniqueGenres: string[] = uniq(flatten(data?.body?.items.map(({ genres }: any) => genres)))

    //     // filter out subgenres
    //     const mainGenres = uniqueGenres
    //       .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
    //       .map((genre) => ({
    //         id: slugify(genre),
    //         selected: true,
    //         name: genre,
    //       }))

    //     setTopGenres(mainGenres)
    //   })
    //   .catch((err) => {
    //     console.log('ERR: ', err);
    //   })

    // spotifyApi.getMyTopTracks({ time_range: 'medium_term', limit: 50 })
    //   .then((data: any) => {
    //     setTopTracks(data?.body?.items.map(({ artists, name, uri }: any, index: number) => ({
    //       id: uri,
    //       index,
    //       name,
    //       artist: artists.map(({ name }: any) => name).join(', '),
    //       selected: true,
    //     })))
    //   })
    //   .catch((err) => {
    //     console.log('ERR: ', err);
    //   })

  }, [spotifyApi, accessToken])

  const toggleItem = (type: DataTypes, term: TermTypes, id: string) => {
    const currentTypeData = intel[type]
    const currentTermData = currentTypeData ? currentTypeData[term] : []

    const currentItem = remove(currentTermData, { id })[0];
    currentItem.selected = !currentItem.selected;

    const updatedTracks = orderBy(
      [...currentTermData, currentItem],
      ['selected', 'index'],
      ['desc', 'asc']
    );

    // setters[type](newTopTracks)
    setIntel((currentIntel: Intel) => ({
      ...currentIntel,
      [type]: {
        ...currentIntel[type],
        [term]: updatedTracks
      }
    }))
  }

  return (
    <Spacer s={{ height: '100%' }}>
      <ElementGroup>
        <Button
          isBlock
          isOutline={activeTab !== 'artists'}
          onClick={() => setActiveTab('artists')}
        >
          Artists
        </Button>
        <Button
          isBlock
          isOutline={activeTab !== 'tracks'}
          onClick={() => setActiveTab('tracks')}
        >
          Tracks
        </Button>
        <Button
          isBlock
          isOutline={activeTab !== 'genres'}
          onClick={() => setActiveTab('genres')}
        >
          Genres
        </Button>
      </ElementGroup>

      { (activeTab === 'artists' || activeTab === 'tracks' ) && (
        <ElementGroup s={{ alignSelf: 'center' }}>
          <Button
            isTermSelector
            isOutline={activeTerm[activeTab] !== 'short_term'}
            onClick={() => setActiveTerm({...activeTerm, [activeTab]: 'short_term'})}
          >
            Short Term
          </Button>
          <Button
            isTermSelector
            isOutline={activeTerm[activeTab] !== 'medium_term'}
            onClick={() => setActiveTerm({...activeTerm, [activeTab]: 'medium_term'})}
          >
            Medium Term
          </Button>
          <Button
            isTermSelector
            isOutline={activeTerm[activeTab] !== 'long_term'}
            onClick={() => setActiveTerm({...activeTerm, [activeTab]: 'long_term'})}
          >
            Long Term
          </Button>
        </ElementGroup>
      ) }

      <Box df fdc s={{ flexGrow: 1, overflowY: 'auto', paddingY: 'm' }}>
        { activeTab === 'artists' ? (
          <Spacer>
            <Box df fdr fww>
              { topArtists.map(({ id, index, name, selected }) => (
                <SelectionLabel
                  onClick={() => toggleItem('artists', activeTerm.artists, id)}
                  key={`artist-${index}`}
                  selected={selected}
                >
                  { name }
                </SelectionLabel>
              )) }
            </Box>
          </Spacer>
        ) : null }

        { activeTab === 'tracks' ? (
          <Spacer>
            <Box>
              { topTracks.map(({ id, index, artist, name, selected }) => (
                <SelectionLabel
                  onClick={() => toggleItem('tracks', activeTerm.tracks, id)}
                  key={`track-${index}`}
                  selected={selected}
                >
                  { artist } - { name }
                </SelectionLabel>
              )) }
            </Box>
          </Spacer>
        ) : null }

        { activeTab === 'genres' ? (
          <Spacer>
            <Box df fdr fww>
              { topGenres.map(({ id, index, name, selected }) => (
                <SelectionLabel
                  onClick={() => toggleItem('genres', activeTerm.genres, id)}
                  key={`genre-${index}`}
                  selected={selected}
                >
                  { startCase(name) }
                </SelectionLabel>
              )) }
            </Box>
          </Spacer>
        ) : null }
      </Box>
    </Spacer>
  )
}
