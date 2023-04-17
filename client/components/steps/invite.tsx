import { Spacer, Title, Box, Button, Input } from '3oilerplate'
import { useContext, useState } from 'react'
import { X as XIcon, Plus as PlusIcon } from 'react-feather'
import { IntelContext } from '../../context/IntelContext'

export const Invite = () => {
  const { invitations, setInvitations } = useContext(IntelContext)
  const [currentInvitation, setCurrentInvitation] = useState('')

  const updateInvitation = (newValue: string, index: number) => {
    let newInvitations = [...invitations]
    newInvitations[index] = newValue
    setInvitations(newInvitations)
  }

  const addInvitation = () => {
    let newInvitations = [...invitations, currentInvitation]
    setInvitations(newInvitations)
    setCurrentInvitation('')
  }

  const removeInvitation = (index: number) => {
    let newInvitations = [...invitations]
    newInvitations.splice(index, 1)
    setInvitations(newInvitations)
  }

  return (
    <Spacer>
      <Box df jcc>
        <Title level="4">Invite your friends</Title>
      </Box>
      {
        invitations.map((invitation: string, index: number) => (
          <Box df key={`input-${index}`}>
            <Input
              s={{ flexGrow: 1 }}
              value={invitation}
              onChange={(newValue: string) => updateInvitation(newValue, index)}
              placeholder="Fill in email address"
            />
            <Button
              s={{ p: 's' }}
              isOutline
              onClick={() => removeInvitation(index)}
            >
              <XIcon size="16" />
            </Button>
          </Box>
        ))
      }
      <Box df>
        <Input
          s={{ flexGrow: 1 }}
          value={currentInvitation}
          onChange={setCurrentInvitation}
          placeholder="Fill in email address"
        />
        <Button
          s={{ p: 's' }}
          isOutline
          isDisabled={!currentInvitation.length}
          onClick={addInvitation}
        >
          <PlusIcon size="16" />
        </Button>
      </Box>

    </Spacer>
  )
}
