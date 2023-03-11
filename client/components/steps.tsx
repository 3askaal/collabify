import { Input, Spacer, Title, Button } from '3oilerplate'
import { FilterData } from './';

export function Steps({ currentStep, onSubmit }: any) {
  switch (currentStep) {
    case 0:
      return (
        <Spacer>
          <Title level="4">Choose a name for your playlist</Title>
          <Input />
        </Spacer>
      )

    case 1:
      return (
        <FilterData />
      )

    default:
      return (
        <Spacer>
          <Button onClick={onSubmit}>Submit</Button>
        </Spacer>
      )
  }
}
