import { useContext, useEffect, useState } from 'react'
import { Box, Button, Link, Spacer } from '3oilerplate'
import { Steps } from '../../components';
import useSpotifyApi from '../../hooks/useSpotifyApi'
import { IntelContext } from '../../context/IntelContext'
import { useRouter } from 'next/router';
import { sampleSize, map } from 'lodash';
import { Status } from '../../components/status';

export default function Playlist() {
  const { query: { id: playlistId, debug }, asPath } = useRouter()
  const { spotifyApi, accessToken, refreshToken, logout } = useSpotifyApi()
  const { setData, hasParticipated, setDebugData, getPlaylistRes, release, refresh, collect } = useContext(IntelContext)
  const [isLoading, setIsLoading] = useState(false)

  const isPublished = getPlaylistRes?.status === 'published'

  useEffect(() => {
    if (!spotifyApi) return
    if (!setData) return

    setIsLoading(true);

    collect({
      data: {
        refreshToken
      }
    })
      .then(({ data }: any) => {
        setData(data)

        if (!debug) {
          setIsLoading(false)
          return
        }

        // get debug data based on own data
        const seed_tracks = map(sampleSize(data.tracks?.short_term, 3), 'id').map((id) => id.split(':')[2])

        collect({
          data: {
            refreshToken,
            debug: true,
            seed_tracks
          }
        }).then(({ data }: any) => {
          setDebugData(data)
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
      <Spacer>
        { !isLoading && hasParticipated && !isPublished && (
          <Button isBlock onClick={release}>Release</Button>
        ) }
        { !isLoading && hasParticipated && isPublished && (
          <Button isBlock onClick={refresh}>Refresh</Button>
        ) }
        { !isLoading && !accessToken && (
          <Link href={`/api/login/participate?redirect_uri=http://${window.location.host + asPath}`}>
            <Button isBlock>Authenticate with Spotify to join</Button>
          </Link>
        ) }
      </Spacer>
    </Box>
  )
}
