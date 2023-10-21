import { useContext } from 'react'
import { useRouter } from 'next/router';
import { Spacer, List, ListItem, Label, Box, Title } from '3oilerplate'
import { DataContext } from '../../context/DataContext';
import { getDefaultPlaylistTitle } from '../../helpers/transform';

export default function Playlists() {
  const router = useRouter()
  const { currentUser, playlists } = useContext(DataContext)

  const invitedPlaylists = playlists?.filter(({ invitations }: any) => invitations.includes(currentUser?.email))
  const partipatedPlaylists = playlists?.filter(({ participations }: any) => participations.some(({ user }: any) => user.id === currentUser?.id))

  const PlaylistListItem = ({ _id, status, title, ...data }: any) => {
    return (
      <ListItem
        key={_id}
        s={{ justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => router.push(`/playlist/${_id}`)}
      >
        <Box df jcsb>
          <span>{ title || getDefaultPlaylistTitle(data) }</span>
          <Label sRef="Label" isWaiting={status === 'waiting'} isReleased={status === 'released'}>{ status }</Label>
        </Box>
      </ListItem>
    )
  }

  return (
    <Spacer size="xl" s={{ justifyContent: 'center' }}>
      { !!invitedPlaylists?.length && (
        <Spacer size="m" s={{ alignItems: 'center' }}>
          <Title level="4">Invited</Title>
          <List>
            { invitedPlaylists?.map(PlaylistListItem) }
          </List>
        </Spacer>
      )}
      { !!partipatedPlaylists?.length && (
        <Spacer size="m" s={{ alignItems: 'center' }}>
          <Title level="4">Participated</Title>
          <List>
            { partipatedPlaylists?.map(PlaylistListItem) }
          </List>
        </Spacer>
      )}
    </Spacer>
  )
}
