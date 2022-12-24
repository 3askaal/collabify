import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Wrapper, Input, List, ListItem } from '3oilerplate'
import SpotifyApi from 'spotify-web-api-node'
import useAuth from '../hooks/useAuth'

const spotifyApi = new SpotifyApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

export default function Dashboard({ code }: any) {
  const accessToken: string = useAuth(code)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!accessToken) return

    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!search) return setResults([])
    if (!accessToken) return

    spotifyApi
      .searchTracks(search)
      .then((data) => {
        console.log('data: ', data)
      })
  }, [search, accessToken])

  return (
    <>
      <Wrapper>
        <Input type="search" value={search} onChange={(value: string) => setSearch(value)}></Input>
        <List>
          <ListItem></ListItem>
        </List>
      </Wrapper>
    </>
  )
}
