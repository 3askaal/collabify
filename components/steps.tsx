import { useState } from 'react';
import { Box, Input, CheckboxGroup, Spacer, Button, Row, Col } from '3oilerplate'
import CollectIntelAuthenticated from './collectIntelAuthenticated';

export default function Steps({ currentStep }: any) {
  switch (currentStep) {
    case 0:
      return (
        <Spacer>
          <p>Choose a name for your playlist</p>
          <Input />
        </Spacer>
      )

    case 1:
      return (
        <Spacer>
          <p>For who is this playlist?</p>
          <CheckboxGroup options={[
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
