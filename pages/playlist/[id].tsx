import { useState } from 'react'
import { Wrapper, Container, Row, Col, Button, Spacer } from '3oilerplate'
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
      <Wrapper s={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Row s={{ width: '100%' }}>
          <Col width={20} />
          <Col width={60} s={{ display: 'flex', alignItems: 'center' }}>
            <Logo small />
          </Col>
          <Col width={20} s={{ alignItems: 'flex-end' }}>
            <Button onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
              <UserIcon />
            </Button>
          </Col>
        </Row>

        <Container s={{ maxWidth: '480px', flexGrow: 1, justifyContent: 'center' }}>
          <Steps currentStep={step} />
        </Container>
        <Spacer s={{ justifyContent: 'center', flexDirection: 'row' }}>
          <Button onClick={onPrev} s={{ p: 's', borderRadius: '100%' }}>
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
