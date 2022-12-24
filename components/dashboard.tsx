import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Wrapper, Title, Input, List, ListItem } from '3oilerplate'
import SpotifyApi from 'spotify-web-api-node'
import useAuth from '../hooks/useAuth'

const spotifyApi = new SpotifyApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

const search: { [key: string]: any } = {
  artists: spotifyApi.searchArtists,
  albums: spotifyApi.searchAlbums,
  tracks: spotifyApi.searchTracks,
}

export default function Dashboard({ code }: any) {
  const accessToken: string = useAuth(code)
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [searchType, setSearchType] = useState('artists')
  const [results, setResults] = useState([])

  const setSearch = (value: string, type: string) => {
    setSearchText(value)
    setSearchType(type)
  }

  useEffect(() => {
    if (!accessToken) return

    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!searchText && searchText.length > 2) return setResults([])
    if (!accessToken) return

    search[searchType](searchText)
      .then((data: any) => {
        console.log('data: ', data)
      })
  }, [searchText, accessToken])

  return (
    <>
      <Wrapper>
        <Box s={{ mb: 'm' }}>
          <Title>Artists</Title>
          <Input type="search" value={searchText} onChange={(value: string) => setSearch(value, 'artists')}></Input>
          <List>
            <ListItem></ListItem>
          </List>
        </Box>
        <Box s={{ mb: 'm' }}>
          <Title>Albums</Title>
          <Input type="search" value={searchText} onChange={(value: string) => setSearch(value, 'albums')}></Input>
          <List>
            <ListItem></ListItem>
          </List>
        </Box>
        <Box s={{ mb: 'm' }}>
          <Title>Songs</Title>
          <Input type="search" value={searchText} onChange={(value: string) => setSearch(value, 'songs')}></Input>
          <List>
            <ListItem></ListItem>
          </List>
        </Box>
      </Wrapper>
    </>
  )
}
