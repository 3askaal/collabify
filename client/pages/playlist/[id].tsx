import { useContext, useEffect } from 'react'
import { Box, Button, Link, Spacer } from '3oilerplate'
import { useRouter } from 'next/router';
import { sampleSize, map } from 'lodash';
import { Steps, Status } from '../../components';
import useSpotify from '../../hooks/useSpotify'
import { IntelContext } from '../../context/IntelContext'

export default function Playlist() {
  const { query: { id: playlistId, debug }, asPath } = useRouter()
  const { accessToken } = useSpotify()
  const { data, setData, setDebugData, playlist, release, refresh, collect, currentUser } = useContext(IntelContext)

  const isReleased = playlist?.status === 'released'
  const hasParticipated = playlist?.participations?.some(({ user }: any) => user.id === currentUser?.id)

  useEffect(() => {
    if (!accessToken) return
    if (!collect) return
    if (playlistId !== 'new') return

    collect({
      data: {
        accessToken: accessToken
      }
    })
      .then(({ data }) => {
        setData(data)

        if (!debug) return

        const seed_tracks = map(sampleSize(data.tracks?.short_term, 3), 'id').map((id) => id.split(':')[2])

        collect({
          data: {
            debug: true,
            seed_tracks,
            accessToken: accessToken
          }
        }).then(({ data }) => {
          setDebugData(data)
        })
        .catch((err: Error) => {
          console.log('collect (debug) err: ', err.message);
        })
      })
      .catch((err: Error) => {
        console.log('collect err: ', err.message);
      })
  }, [accessToken, playlistId])

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
      { playlistId === 'new'
        ? <Steps />
        : <Status />
      }
      {playlistId !== 'new' && (
        <Spacer>
          { data && hasParticipated && !isReleased && (
            <Button isBlock onClick={release}>Release</Button>
          ) }
          { data && isReleased && (
            <Button isBlock onClick={refresh}>Refresh</Button>
          ) }
          { data && !accessToken && (
            <Link href={`/api/login/participate?redirect_uri=http://${window.location.host + asPath}`}>
              <Button isBlock>Authenticate with Spotify to join</Button>
            </Link>
          ) }
        </Spacer>
      )}
    </Box>
  )
}
