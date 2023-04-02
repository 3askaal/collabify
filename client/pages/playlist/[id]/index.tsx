import { useContext, useEffect, useState } from 'react'
import { Box, Wrapper, Container, Button, Spacer } from '3oilerplate'
import { User as UserIcon } from 'react-feather'
import { Logo, Steps } from '../../../components';
import useSpotifyApi from '../../../hooks/useSpotifyApi'
import { IntelContext } from '../../../context/IntelContext'
import { collectData } from '../../../helpers'
import { useRouter } from 'next/router';
import { sampleSize, map } from 'lodash';
import { PlaylistStatus } from '../../../components/status';

export default function Playlist() {
  const router = useRouter()
  const { spotifyApi, accessToken, logout } = useSpotifyApi()
  const { setData, hasParticipated, setDebugData, release } = useContext(IntelContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!spotifyApi) return
    if (!setData) return

    collectData(spotifyApi).then((data) => {
      setData(data)

      if (!router.query.debug) {
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
  }, [spotifyApi, accessToken, setData, setDebugData])

  return (
    <>
      <Wrapper s={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', gridTemplateColumns: '1fr', justifyItems: 'center', gap: 'm' }}>

        <Box df w100p jcc>
          <Logo small />
        </Box>

        <Box posa r='0' t='0' s={{ p: 'm' }}>
          <Button isOutline onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
            <UserIcon size="14" />
          </Button>
        </Box>

        <Container s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', maxWidth: '640px' }}>
          { isLoading
            ? <Box s={{ textAlign: 'center' }}>Wait a second while we fetch your data...</Box>
            : hasParticipated
              ? <PlaylistStatus />
              : <Steps />
          }
        </Container>

        { !isLoading && hasParticipated && (
          <Button isBlock onClick={release}>Release</Button>
        ) }

      </Wrapper>
    </>
  )
}
