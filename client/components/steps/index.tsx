import { Input, Spacer, Title, Button, Box } from '3oilerplate'
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'react-feather'
import { IntelContext } from '../../context/IntelContext';
import { FilterData, Invite } from '..';

const Details = () => {
  const { setName } = useContext(IntelContext)

  return (
    <Spacer>
      <Box df jcc>
        <Title level="4">Name your playlist</Title>
      </Box>
      <Input onChange={setName} />
    </Spacer>
  )
}

const Submit = ({ id }: { id: string }) => {
  const { submitData } = useContext(IntelContext)

  return (
    <Spacer>
      <Button onClick={submitData}>{ id === 'new' ? 'Create' : 'Join' } playlist</Button>
    </Spacer>
  )
}

export function Steps() {
  const router = useRouter()
  const [step, setStep] = useState(0);

  const steps = router.query.id === 'new' ? [
    <Details key="Details" />,
    <FilterData key="FilterData" />,
    <Invite key="Invite" />,
    <Submit key="Submit" id={(router?.query?.id || '') as string} />
  ] : [
    <FilterData key="FilterData" />,
    <Submit key="Submit" id={(router?.query?.id || '') as string} />
  ]

  const onPrev = () => {
    if (step === 0) return
    setStep((currentStep) => currentStep - 1)
  }

  const onNext = () => {
    if (step === steps.length - 1) return
    setStep((currentStep) => currentStep + 1)
  }

  return (
    <>
      <Spacer s={{flexGrow: 1}}>
        <Box df s={{ flexGrow: 1 }}>
          { steps.map((Step, index) => step === index && Step) }
        </Box>
        <Spacer s={{ justifyContent: 'center', flexDirection: 'row', justifySelf: 'flex-end' }}>
          { step !== 0 && (
            <Button isOutline onClick={onPrev} s={{ p: 's', borderRadius: '100%' }}>
              <ArrowLeftIcon />
            </Button>
          ) }
          { step !== steps.length - 1 && (
            <Button isOutline onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
              <ArrowRightIcon />
            </Button>
          ) }
        </Spacer>
      </Spacer>
    </>
  )
}
