import { Input, RadioGroup, Spacer, Title } from '3oilerplate'
import CollectIntelAuthenticated from './collectIntelAuthenticated';

export default function Steps({ currentStep }: any) {
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
        <CollectIntelAuthenticated />
      )

    default:
      return (
        <></>
      )
  }
}
