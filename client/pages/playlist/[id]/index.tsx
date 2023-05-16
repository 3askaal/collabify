import { useContext, useEffect, useState } from 'react'
import { Box } from '3oilerplate'
import { Steps } from '../../../components';
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
      {
        isLoading
            ? <Box s={{ display: 'grid', gridTemplateRows: '1fr', alignItems: 'center', justifyContent: 'center' }}>Wait a second while we fetch your data...</Box>
            : hasParticipated
              ? <PlaylistStatus />
              : <Steps />
      }
    </>
  )
}
