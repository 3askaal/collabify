import { useRouter } from 'next/router'
import { Wrapper, Container, Row, Col, Button } from '3oilerplate'
import Logo from '../../components/logo'
import Steps from '../../components/steps'
import { useState } from 'react'

export default function Home() {
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
        <Logo small />
        <Container s={{ maxWidth: '640px', flexGrow: 1, justifyContent: 'center' }}>
          <Steps currentStep={step} />
        </Container>
        <Row>
          <Col><Button onClick={onPrev}>Previous</Button></Col>
          <Col><Button onClick={onNext}>Next</Button></Col>
        </Row>
      </Wrapper>
    </>
  )
}
