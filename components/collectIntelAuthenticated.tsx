import { useEffect, useState } from 'react'
import { Spacer, Box, Container, Wrapper, Title, Input, Label, Row, Col } from '3oilerplate'
import useSpotifyApi from '../hooks/useSpotifyApi'

const searchHandlers: { [key: string]: string } = {
  artists: 'searchArtists',
  tracks: 'searchTracks',
}

export default function CollectIntelAuthenticated({ code }: any) {
  const { spotifyApi } = useSpotifyApi(code)

  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])

  useEffect(() => {
    if (!spotifyApi) return

    spotifyApi.getMyTopArtists({ time_range: 'long_term', limit: 100 })
      .then((data: any) => {
        setTopArtists(data?.body?.items.map(({ name }: any) => ({
          name
        })))
      })

    spotifyApi.getMyTopTracks({ time_range: 'long_term', limit: 100 })
      .then((data: any) => {
        setTopTracks(data?.body?.items.map(({ artists, name }: any) => ({
          artist: artists.map(({ name }: any) => name).join(', '),
          name
        })))
      })

  }, [spotifyApi])

  return (
    <>
      <Wrapper>
        <Container>
          <Spacer>
            { !!topArtists.length && (
              <Box>
                <Title>Your Top Artists</Title>
                <Row>
                { topArtists.map(({ name }, index) => (
                  <Col s={{ flexGrow: 0 }} key={`artist-${index}`}>
                    <Label sRef="Label">{ name }</Label>
                  </Col>
                )) }
                </Row>
              </Box>
            )}
            { !!topArtists.length && (
              <Box>
                <Title>Your Top Tracks</Title>
                <Row>
                  { topTracks.map(({ artist, name }, index) => (
                    <Col s={{ flexGrow: 0 }} key={`track-${index}`}>
                      <Label sRef="Label">{ artist } - { name }</Label>
                    </Col>
                  )) }
                </Row>
              </Box>
            )}
          </Spacer>
        </Container>
      </Wrapper>
    </>
  )
}
