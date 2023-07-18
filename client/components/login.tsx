import { Button } from '3oilerplate'
import Link from 'next/link'
import useSpotifyApi from '../hooks/useSpotifyApi'

export function Login() {
  const { login } = useSpotifyApi()

  return (
    <Button onClick={login}>Authenticate with Spotify</Button>
  )
}
