import { useEffect, useState } from 'react'
import { Spacer, Box, Container, Wrapper, Title, Label } from '3oilerplate'
import useSpotifyApi from '../hooks/useSpotifyApi'
import { capitalize, flatten, uniq } from 'lodash'

export default function CollectIntelAuthenticated() {
  const { spotifyApi, accessToken } = useSpotifyApi()

  const [topArtists, setTopArtists] = useState([])
  const [topGenres, setTopGenres] = useState([])
  const [topTracks, setTopTracks] = useState([])

  useEffect(() => {
    if (!spotifyApi) return

    spotifyApi.getMyTopArtists({ time_range: 'medium_term', limit: 50 })
      .then((data: any) => {
        console.log(data?.body?.items)
        setTopArtists(data?.body?.items.map(({ name }: any) => ({
          name
        })))

        setTopGenres(uniq(flatten(data?.body?.items.map(({genres}: any) => genres))))
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
                    <Label sRef="Label" key={`artist-${index}`} s={{ mb: 's', mr: 's' }}>#{ index + 1 } { capitalize(genre) }</Label>
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
