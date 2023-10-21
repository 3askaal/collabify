import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'react-feather'
import { Input, Spacer, Button, Box, Checkbox, Select, Text } from '3oilerplate'
import { DataContext } from '../../context/DataContext';
import { FilterData, Invite } from '..';
import { IConfig } from '../../../server/types/playlist';
import useApi from '../../hooks/useApi';

const Details = () => {
  const { config, setConfig } = useContext(DataContext)
  const { currentUser } = useContext(DataContext);
  const [shouldRefresh, setShouldRefresh] = useState(false)

  useEffect(() => {
    setConfig((details) => ({ ...details, refreshEvery: shouldRefresh ? 'week' : undefined }))
  }, [shouldRefresh])

  return (
    <Box df fdc s={{ flexGrow: 1, justifyContent: 'center' }}>
      <Spacer size="xl">
        <Spacer size="l">
          <Input huge placeholder={`${currentUser?.name} x ...`} onChange={(value: string) => setConfig((details) => ({ ...details, title: value}))} />
          <Input huge placeholder="Generated with collabify.vercel.app" onChange={(value: string) => setConfig((details) => ({ ...details, description: value }))} />
        </Spacer>
        <Spacer size="l">
          <Spacer size="xs">
            <Text isLabel>Size</Text>
            <Select
              block
              options={[
                {
                  label: 'Small',
                  value: 's',
                },
                {
                  label: 'Medium',
                  value: 'm',
                },
                {
                  label: 'Large',
                  value: 'l',
                },
              ]}
              value={config.size}
              onChange={(value: IConfig['size']) => setConfig((details) => ({ ...details, size: value }))}
            />
          </Spacer>
          <Spacer size="xs">
            <Text isLabel>Refresh</Text>
            <Select
              block
              options={[
                {
                  label: 'Never',
                  value: null,
                },
                {
                  label: 'Weekly',
                  value: 'week',

                },
                {
                  label: 'Monthly',
                  value: 'month',
                },
              ]}
              onChange={(value: IConfig['refreshEvery']) => setConfig((details) => ({ ...details, refreshEvery: value }))}
            />
          </Spacer>
          <Checkbox label="Add recommendations" onChange={(value: boolean) => setConfig((details) => ({ ...details, recommendations: value }))} />
        </Spacer>
      </Spacer>
    </Box>
  )
}

const Submit = ({ id }: { id: string }) => {
  const { submit } = useApi()

  return (
    <Spacer s={{ flexGrow: 1, justifyContent: 'center' }}>
      <Button onClick={submit}>{ id === 'new' ? 'Create' : 'Join' } playlist</Button>
    </Spacer>
  )
}

export const Steps = () => {
  const { query: { id }} = useRouter()
  const [step, setStep] = useState(0);

  const steps = [
    <Details key="Details" />,
    <FilterData key="FilterData" />,
    <Invite key="Invite" />,
    <Submit key="Submit" id={id as string} />
  ];

  const onPrev = () => {
    if (step === 0) return
    setStep((currentStep) => currentStep - 1)
  }

  const onNext = () => {
    if (step === steps.length - 1) return
    setStep((currentStep) => currentStep + 1)
  }

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 'm' }}>
      { steps.map((Step, index) => step === index && Step) }
      <Spacer s={{ justifyContent: 'center', flexDirection: 'row', justifySelf: 'flex-end' }}>
        { step !== 0 && (
          <Button isOutline onClick={onPrev} s={{ p: 's', borderRadius: '100%' }}>
            <ChevronLeftIcon />
          </Button>
        ) }
        { step !== steps.length - 1 && (
          <Button isOutline onClick={onNext} s={{ p: 's', borderRadius: '100%' }}>
            <ChevronRightIcon />
          </Button>
        ) }
      </Spacer>
    </Box>
  )
}
