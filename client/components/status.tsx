import { Spacer, Title, List, ListItem, Row, Col, Text, Label } from '3oilerplate'
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
        <Row>
          <Col width={50}><strong>Name:</strong></Col>
          <Col width={50} s={{ textAlign: 'right' }}>{ playlistName }</Col>
        </Row>
        <Row>
          <Col width={50}><strong>Description:</strong></Col>
          <Col width={50} s={{ textAlign: 'right' }}>{ playlistDesc }</Col>
        </Row>
        <Row>
          <Col width={50}><strong>Status:</strong></Col>
          <Col width={50} s={{ textAlign: 'right' }}><Label sRef="Label" isWaiting={getDataRes?.status === 'waiting'} isCompleted={getDataRes?.status === 'completed'}>{ getDataRes?.status }</Label></Col>
        </Row>
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
