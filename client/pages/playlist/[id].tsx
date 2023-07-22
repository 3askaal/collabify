import { useContext, useEffect, useState } from 'react'
import { Box, Button, Link, Spacer } from '3oilerplate'
import { useRouter } from 'next/router';
import { sampleSize, map } from 'lodash';
import { Steps } from '../../components';
import useSpotifyApi from '../../hooks/useSpotifyApi'
import { IntelContext } from '../../context/IntelContext'
import { Status } from '../../components/status';

export default function Playlist() {
  const { query: { id: playlistId, debug }, asPath } = useRouter()
  const { spotifyApi, accessToken, refreshToken, logout } = useSpotifyApi()
  const { data, setData, hasParticipated, setDebugData, playlist, release, refresh, collect } = useContext(IntelContext)

  const isPublished = playlist?.status === 'published'

  useEffect(() => {
    if (!spotifyApi) return
    if (!setData) return
    if (playlistId !== 'new') return

    collect({
      data: {
        refreshToken
      }
    })
      .then(({ data }: any) => {
        setData(data)

        if (!debug) return

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
        })
      })
      .catch(() => {
        logout()
      })
  }, [spotifyApi, accessToken, setData, setDebugData, playlistId])

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
      { accessToken && playlistId === 'new'
        ? <Steps />
        : <Status />
      }
      <Spacer>
        { !data && hasParticipated && !isPublished && (
          <Button isBlock onClick={release}>Release</Button>
        ) }
        { !data && isPublished && (
          <Button isBlock onClick={refresh}>Refresh</Button>
        ) }
        { !data && !accessToken && (
          <Link href={`/api/login/participate?redirect_uri=http://${window.location.host + asPath}`}>
            <Button isBlock>Authenticate with Spotify to join</Button>
          </Link>
        ) }
      </Spacer>
    </Box>
  )
}
