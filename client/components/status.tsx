import { Spacer, Title, List, ListItem, Button, Text, Label } from '3oilerplate'
import { useContext } from 'react'
import { IntelContext } from '../context/IntelContext'

export const PlaylistStatus = () => {
  const { release, getDataRes, me } = useContext(IntelContext)

  const playlistName = getDataRes?.name || getDataRes?.participations.map(({ user }: any) => user.name).join(' x ')
  const playlistDesc = getDataRes?.description || 'Playlist generated with collabify'

  return (
    <Spacer size="l">
      <Spacer size="s" s={{ alignItems: 'center' }}>
        <Title>Details</Title>
        <Text><strong>Name:</strong>&nbsp;&nbsp;{ playlistName }</Text>
        <Text><strong>Description:</strong>&nbsp;&nbsp;{ playlistDesc }</Text>
        <Text><strong>Status:</strong>&nbsp;&nbsp;<Label sRef="Label" isWaiting={getDataRes?.status === 'waiting'} isCompleted={getDataRes?.status === 'completed'}>{ getDataRes?.status }</Label></Text>
      </Spacer>
      <Spacer>
        <Title s={{ textAlign: 'center' }}>Participations</Title>
        <List>
          { getDataRes?.participations.map(({ user }: any) => (
            <ListItem s={{ display: 'flex', justifyContent: 'space-between' }} key={user?.id}>{user?.name} <strong>{user.id === me.id ? 'You' : ''}</strong></ListItem>
          )) || [] }
        </List>
      </Spacer>
    </Spacer>
  )
}
