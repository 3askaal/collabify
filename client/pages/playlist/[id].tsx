import { useContext, useEffect, useState } from 'react'
import { Box, Wrapper, Container, Button, Spacer } from '3oilerplate'
import { User as UserIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'react-feather'
import { Logo, Steps } from '../../components';
import useSpotifyApi from '../../hooks/useSpotifyApi'
import { IntelContext } from '../../context/IntelContext'
import { collectData } from '../../helpers'

export default function Playlist() {
  const { spotifyApi, accessToken, logout } = useSpotifyApi()
  const { setData } = useContext(IntelContext)

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
    })
  }, [spotifyApi, accessToken, setData])

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
          <Steps currentStep={step} />
        </Container>

        <Spacer s={{ justifyContent: 'center', flexDirection: 'row' }}>
          <Button isOutline onClick={onPrev} s={{ p: 's', borderRadius: '100%' }} isDisabled={step === 0}>
            <ArrowLeftIcon />
          </Button>
          <Button isOutline onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
            <ArrowRightIcon />
          </Button>
        </Spacer>

      </Wrapper>
    </>
  )
}
