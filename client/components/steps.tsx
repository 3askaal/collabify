import { Input, Spacer, Title, Button } from '3oilerplate'
import { useContext } from 'react';
import { IntelContext } from '../context/IntelContext';
import { FilterData } from './';

export function Steps({ currentStep, onSubmit }: any) {
  const { setName, release } = useContext(IntelContext)

  switch (currentStep) {
    case 0:
      return (
        <Spacer>
          <Title level="4">Choose a name for your playlist</Title>
          <Input onChange={setName} />
        </Spacer>
      )

    case 1:
      return (
        <FilterData />
      )

    default:
      return (
        <Spacer>
          <Button onClick={release}>Submit</Button>
        </Spacer>
      )
  }
}
