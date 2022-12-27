import { useEffect, useState } from 'react'
import { Spacer, Box, Container, Wrapper, Title } from '3oilerplate'
import { flatten, orderBy, remove, startCase, uniq } from 'lodash'
import slugify from 'slugify';
import useSpotifyApi from '../hooks/useSpotifyApi'
import SelectionLabel from './selectionLabel'

export default function CollectIntelAuthenticated() {
  const { spotifyApi, accessToken } = useSpotifyApi()

  const [topGenres, setTopGenres] = useState<any[]>([])
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])

  const getters: {[key: string]: any} = {
    genres: topGenres,
    artists: topArtists,
    tracks: topTracks,
  }

  const setters: {[key: string]: any} = {
    genres: setTopGenres,
    artists: setTopArtists,
    tracks: setTopTracks,
  }

  useEffect(() => {
    if (!spotifyApi) return

    spotifyApi.getMyTopArtists({ time_range: 'medium_term', limit: 50 })
      .then((data: any) => {
        const artists = data?.body?.items.map(({ name, uri }: any, index: number) => ({
          id: uri,
          index,
          name,
          selected: true
        }))
        setTopArtists(artists)

        // includes alot of subgenres
        const uniqueGenres: string[] = uniq(flatten(data?.body?.items.map(({ genres }: any) => genres)))

        // filter out subgenres
        const mainGenres = uniqueGenres
          .filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))
          .map((genre) => ({
            id: slugify(genre),
            selected: true,
            name: genre,
          }))

        setTopGenres(mainGenres)
      })
      .catch((err) => {
        console.log('ERR: ', err);
      })

    spotifyApi.getMyTopTracks({ time_range: 'medium_term', limit: 50 })
      .then((data: any) => {
        setTopTracks(data?.body?.items.map(({ artists, name, uri }: any, index: number) => ({
          id: uri,
          index,
          name,
          artist: artists.map(({ name }: any) => name).join(', '),
          selected: true,
        })))
      })
      .catch((err) => {
        console.log('ERR: ', err);
      })

  }, [spotifyApi, accessToken])

  const toggleItem = (type: string, id: string) => {
    const currentTopTracks = [...getters[type]];

    const currentItem = remove(currentTopTracks, { id })[0];
    currentItem.selected = !currentItem.selected;

    const newTopTracks = orderBy(
      [...currentTopTracks, currentItem],
      ['selected', 'index'],
      ['desc', 'asc']
    );

    setters[type](newTopTracks)
  }

  return (
    <>
      <Wrapper>
        <Container>
          <Spacer>
          { !!topGenres.length && (
              <Spacer>
                <Title>Your Top Genres</Title>
                <Box df fdr fww>
                  { topGenres.map(({ id, index, name, selected }) => (
                    <SelectionLabel
                      onClick={() => toggleItem('genres', id)}
                      key={`genre-${index}`}
                      selected={selected}
                    >
                      { startCase(name) }
                    </SelectionLabel>
                  )) }
                </Box>
              </Spacer>
            )}
            { !!topArtists.length && (
              <Spacer>
                <Title>Your Top Artists</Title>
                <Box df fdr fww>
                  { topArtists.map(({ id, index, name, selected }) => (
                    <SelectionLabel
                      onClick={() => toggleItem('artists', id)}
                      key={`artist-${index}`}
                      selected={selected}
                    >
                      { name }
                    </SelectionLabel>
                  )) }
                </Box>
              </Spacer>
            )}
            { !!topArtists.length && (
              <Spacer>
                <Title>Your Top Tracks</Title>
                <Box>
                  { topTracks.map(({ id, index, artist, name, selected }) => (
                    <SelectionLabel
                      onClick={() => toggleItem('tracks', id)}
                      key={`track-${index}`}
                      selected={selected}
                    >
                      { artist } - { name }
                    </SelectionLabel>
                  )) }
                </Box>
              </Spacer>
            )}
          </Spacer>
        </Container>
      </Wrapper>
    </>
  )
}
