import { useContext } from 'react'
import { useRouter } from 'next/router';
import { Spacer, List, ListItem, Label, Box, Title } from '3oilerplate'
import { IntelContext } from '../../context/IntelContext';
import { getDefaultPlaylistTitle } from '../../helpers/transform';

export default function Playlists() {
  const router = useRouter()
  const { getPlaylistsRes, me } = useContext(IntelContext)

  const invitedPlaylists = getPlaylistsRes?.filter(({ invitations }: any) => invitations.includes(me.email))
  const partipatedPlaylists = getPlaylistsRes?.filter(({ participations }: any) => participations.some(({ user }: any) => user.id === me.id))

  const PlaylistListItem = ({ _id, status, title, ...data }: any) => {
    return (
      <ListItem
        key={_id}
        s={{ justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => router.push(`/playlist/${_id}`)}
      >
        <Box df jcsb>
          <span>{ title || getDefaultPlaylistTitle(data) }</span>
          <Label sRef="Label" isWaiting={status === 'waiting'} isCompleted={status === 'completed'}>{ status }</Label>
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
