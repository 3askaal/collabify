import { useContext } from 'react'
import { useRouter } from 'next/router';
import { Spacer, List, ListItem, Label } from '3oilerplate'
import { IntelContext } from '../../context/IntelContext';
import { getDefaultPlaylistTitle } from '../../helpers/transform';

export default function Participated() {
  const router = useRouter()
  const { getPlaylistsRes } = useContext(IntelContext)

  return (
    <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
      <List>
        { getPlaylistsRes?.map(({ _id, status, title, ...data }: any) => (
          <ListItem
            key={_id}
            s={{ justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => router.push(`/playlist/${_id}`)}
          >
            <span>{ title || getDefaultPlaylistTitle(data) }</span>
            <Label sRef="Label" isWaiting={status === 'waiting'} isCompleted={status === 'completed'}>{ status }</Label>
          </ListItem>
        )) }
      </List>
    </Spacer>
  )
}
