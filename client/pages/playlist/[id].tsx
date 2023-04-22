import { useContext, useEffect, useState } from 'react'
import { Box, Button, Link } from '3oilerplate'
import { Steps } from '../../components';
import useSpotifyApi from '../../hooks/useSpotifyApi'
import { IntelContext } from '../../context/IntelContext'
import { collectData } from '../../helpers'
import { useRouter } from 'next/router';
import { sampleSize, map } from 'lodash';
import { Status } from '../../components/status';

export default function Playlist() {
  const { query: { id: playlistId, debug }, asPath } = useRouter()
  const { spotifyApi, accessToken, logout } = useSpotifyApi()
  const { setData, hasParticipated, setDebugData, release } = useContext(IntelContext)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!spotifyApi) return
    if (!setData) return

    setIsLoading(true);

    collectData(spotifyApi)
      .then((data) => {
        setData(data)

        if (!debug) {
          setIsLoading(false)
          return
        }

        // get debug data based on own data
        const seed_tracks = map(sampleSize(data.tracks?.short_term, 3), 'id').map((id) => id.split(':')[2])

        collectData(spotifyApi, true, seed_tracks).then((debugData) => {
          setDebugData(debugData)
          setIsLoading(false)
        })
      })
      .catch(() => {
        logout()
      })
  }, [spotifyApi, accessToken, setData, setDebugData])

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
      {
        isLoading
          ? <Box s={{ display: 'grid', gridTemplateRows: '1fr', alignItems: 'center', justifyContent: 'center' }}>Wait a second while we fetch your data...</Box>
          : accessToken && playlistId === 'new'
            ? <Steps />
            : <Status />
      }
      { !isLoading && hasParticipated && (
        <Button isBlock onClick={release}>Release</Button>
      ) }
      { !isLoading && !accessToken && (
        <Link href={`/api/login/participate?redirect_uri=http://${window.location.host + asPath}`}>
          <Button isBlock>Authenticate with Spotify to join</Button>
        </Link>
      ) }
    </Box>
  )
}
