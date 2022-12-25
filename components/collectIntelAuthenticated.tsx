import { useEffect, useState } from 'react'
import { Spacer, Box, Container, Wrapper, Title, Label } from '3oilerplate'
import useSpotifyApi from '../hooks/useSpotifyApi'
import { flatten, startCase, uniq } from 'lodash'

export default function CollectIntelAuthenticated() {
  const { spotifyApi, accessToken } = useSpotifyApi()

  const [topGenres, setTopGenres] = useState<string[]>([])
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])

  useEffect(() => {
    if (!spotifyApi) return

    spotifyApi.getMyTopArtists({ time_range: 'medium_term', limit: 50 })
      .then((data: any) => {
        const artists = data?.body?.items.map(({ name }: any) => ({ name }))
        setTopArtists(artists)

        // includes alot of subgenres
        const uniqueGenres: string[] = uniq(flatten(data?.body?.items.map(({ genres }: any) => genres)))

        // filter out subgenres
        const mainGenres = uniqueGenres.filter((genre1) => uniqueGenres.some((genre2) => genre1 !== genre2 && genre2.includes(genre1)))

        setTopGenres(mainGenres)
      })
      .catch((err) => {
        console.log('ERR: ', err);
      })

    spotifyApi.getMyTopTracks({ time_range: 'medium_term', limit: 50 })
      .then((data: any) => {
        setTopTracks(data?.body?.items.map(({ artists, name }: any) => ({
          artist: artists.map(({ name }: any) => name).join(', '),
          name
        })))
      })
      .catch((err) => {
        console.log('ERR: ', err);
      })

  }, [spotifyApi, accessToken])

  return (
    <>
      <Wrapper>
        <Container>
          <Spacer>
          { !!topGenres.length && (
              <Spacer>
                <Title>Your Top Genres</Title>
                <Box df fdr fww>
                  { topGenres.map((genre, index) => (
                    <Label sRef="Label" key={`artist-${index}`} s={{ mb: 's', mr: 's' }}>#{ index + 1 } { startCase(genre) }</Label>
                  )) }
                </Box>
              </Spacer>
            )}
            { !!topArtists.length && (
              <Spacer>
                <Title>Your Top Artists</Title>
                <Box df fdr fww>
                  { topArtists.map(({ name }, index) => (
                    <Label sRef="Label" key={`artist-${index}`} s={{ mb: 's', mr: 's' }}>#{ index + 1 } { name }</Label>
                  )) }
                </Box>
              </Spacer>
            )}
            { !!topArtists.length && (
              <Spacer>
                <Title>Your Top Tracks</Title>
                <Box>
                  { topTracks.map(({ artist, name }, index) => (
                    <Label sRef="Label" key={`track-${index}`} s={{ mb: 's' }}>#{ index + 1 } { artist } - { name }</Label>
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
