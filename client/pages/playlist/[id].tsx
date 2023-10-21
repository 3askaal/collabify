import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router';
import { Box, Button, Link, Spacer } from '3oilerplate'
import { Steps, Status } from '../../components';
import useSpotify from '../../hooks/useSpotify'
import { DataContext } from '../../context/DataContext'
import useApi from '../../hooks/useApi';

export default function Playlist() {
  const { query: { id: playlistId }, asPath } = useRouter()
  const { accessToken } = useSpotify()
  const { release, refresh, collect, playlist } = useApi()
  const { currentUser, data } = useContext(DataContext);

  const isReleased = playlist?.status === 'released'
  const hasParticipated = playlist?.participations?.some(({ user }: any) => user.id === currentUser?.id)

  useEffect(() => {
    if (playlistId !== 'new') return;

    collect()
  }, [])

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
      { playlistId === 'new'
        ? <Steps />
        : (
          <>
            <Status />
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
          </>
        )
      }
    </Box>
  )
}
