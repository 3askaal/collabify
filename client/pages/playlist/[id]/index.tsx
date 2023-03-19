import { useContext, useEffect, useState } from 'react'
import { Box, Wrapper, Container, Button, Spacer } from '3oilerplate'
import { User as UserIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'react-feather'
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
  const { setData, hasParticipated, submitData, setDebugData, release } = useContext(IntelContext)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(0);

  const onPrev = () => {
    setStep((currentStep) => currentStep - 1)
  }

  const onNext = () => {
    setStep((currentStep) => currentStep + 1)
  }

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
      <Wrapper s={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 'm' }}>

        <Box df w100p jcc>
          <Logo small />
        </Box>

        <Box posa r='0' t='0' s={{ p: 'm' }}>
          <Button isOutline onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
            <UserIcon size="14" />
          </Button>
        </Box>

        <Container s={{ maxWidth: '480px', justifyContent: 'center', flexGrow: 1, overflowY: 'hidden', my: 'm' }}>
          { isLoading ? <Box s={{ textAlign: 'center' }}>Wait a second while we fetch your data...</Box> : hasParticipated ? <PlaylistStatus /> : <Steps currentStep={step} onSubmit={submitData} /> }
        </Container>

        { !isLoading && !hasParticipated && (
          <Spacer s={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Button isOutline onClick={onPrev} s={{ p: 's', borderRadius: '100%' }} isDisabled={step === 0}>
              <ArrowLeftIcon />
            </Button>
            <Button isOutline onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
              <ArrowRightIcon />
            </Button>
          </Spacer>
        )}

        { !isLoading && hasParticipated && (
          <Button isBlock onClick={release}>Release</Button>
        ) }

      </Wrapper>
    </>
  )
}
