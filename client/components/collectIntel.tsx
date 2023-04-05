import { useEffect, useState } from 'react'
import { Spacer, Container, Wrapper, Title, Input, List, ListItem } from '3oilerplate'
import useSpotifyApi from '../hooks/useSpotifyApi'

const searchHandlers: { [key: string]: string } = {
  artists: 'searchArtists',
  tracks: 'searchTracks',
}

export default function CollectIntel({ code }: any) {
  const { spotifyApi }: any = useSpotifyApi(code)
  const [searchText, setSearchText] = useState<any>({
    artists: '',
    tracks: '',
  })

  const [searchType, setSearchType] = useState('artists')
  const [results, setResults] = useState([])

  const setSearch = (value: string, type: string) => {
    setSearchText((current: any) => ({ ...current, [type]: value }))
    setSearchType(type)
  }

  useEffect(() => {
    if (!spotifyApi) return
    if (!searchType || !searchText[searchType]) return setResults([])

    spotifyApi[searchHandlers[searchType]](searchText[searchType])
      .then((data: any) => {
        setResults(data?.body[searchType]?.items.map(({ name }: any) => ({ name })))
      })

  }, [searchType, searchText, spotifyApi])

  return (
    <>
      <Wrapper>
        <Container>
          <Spacer s={{ mb: 'm' }}>
            <Title>Artists</Title>
            <Input type="search" value={searchText.artists} onChange={(value: string) => setSearch(value, 'artists')}></Input>
            { searchType === 'artists' && results.length ? (
              <List>
                { results.map(({ name }, index) => (
                  <ListItem key={`artist-${index}`}>{ name }</ListItem>
                )) }
              </List>
            ) : null }
          </Spacer>
          <Spacer s={{ mb: 'm' }}>
            <Title>Songs</Title>
            <Input type="search" value={searchText.tracks} onChange={(value: string) => setSearch(value, 'tracks')}></Input>
            { searchType === 'tracks' && results.length ? (
              <List>
                { results.map(({ name }, index) => (
                  <ListItem key={`track-${index}`}>{ name }</ListItem>
                )) }
              </List>
            ) : null }
          </Spacer>
        </Container>
      </Wrapper>
    </>
  )
}
