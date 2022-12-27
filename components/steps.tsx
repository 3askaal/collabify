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
        <Spacer>
          <Title level="4">For who is this playlist?</Title>
          <RadioGroup options={[
            { label: 'Friend', value: 'friend' },
            { label: 'Crush', value: 'crush' },
          ]} />
        </Spacer>
      )

    case 2:
      return (
        <CollectIntelAuthenticated />
      )

    default:
      return (
        <></>
      )
  }
}
