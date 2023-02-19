import { useState } from 'react'
import { Box, Wrapper, Container, Row, Col, Button, Spacer } from '3oilerplate'
import { User as UserIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'react-feather'
import Logo from '../../components/logo'
import Steps from '../../components/steps'
import useSpotifyApi from '../../hooks/useSpotifyApi'

export default function Playlist() {
  const { logout } = useSpotifyApi()
  const [step, setStep] = useState(0);

  const onPrev = () => {
    setStep((currentStep) => currentStep - 1)
  }

  const onNext = () => {
    setStep((currentStep) => currentStep + 1)
  }

  return (
    <>
      <Wrapper s={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 'm' }}>
        <Box df w100p jcc>
          <Logo small />
        </Box>
        <Box posa r='0' t='0' s={{ p: 'm' }}>
          <Button onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
            <UserIcon size="14" />
          </Button>
        </Box>
        {/* <Row s={{ width: '100%' }}>
          <Col width={20} />
          <Col width={60} s={{ display: 'flex', alignItems: 'center' }}>
          </Col>
          <Col width={20} s={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
              <UserIcon />
            </Button>
          </Col>
        </Row> */}

        <Container s={{ maxWidth: '480px', justifyContent: 'center', flexGrow: 1, overflowY: 'auto' }}>
          <Steps currentStep={step} />
        </Container>

        <Spacer s={{ justifyContent: 'center', flexDirection: 'row' }}>
          <Button onClick={onPrev} s={{ p: 's', borderRadius: '100%' }} isDisabled={step === 0}>
            <ArrowLeftIcon />
          </Button>
          <Button onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
            <ArrowRightIcon />
          </Button>
        </Spacer>
      </Wrapper>
    </>
  )
}
