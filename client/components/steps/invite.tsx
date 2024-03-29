import { Spacer, Title, Box, Button, Input } from '3oilerplate'
import { useContext, useState } from 'react'
import { X as XIcon, Plus as PlusIcon } from 'react-feather'
import { DataContext } from '../../context/DataContext'

export const Invite = () => {
  const { invitations, setInvitations } = useContext(DataContext)
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
    <Spacer s={{ flexGrow: 1, overflow: 'hidden', justifyContent: 'center' }}>
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
              s={{ p: 's', background: 'none', border: 0, borderBottom: '1px solid', borderColor: 'primary', color: 'primary', borderRadius: 0 }}
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
          s={{ p: 's', background: 'none', border: 0, borderBottom: '1px solid', borderColor: 'primary', color: 'primary', borderRadius: 0 }}
          isDisabled={!currentInvitation.length}
          onClick={addInvitation}
        >
          <PlusIcon size="16" />
        </Button>
      </Box>

    </Spacer>
  )
}
