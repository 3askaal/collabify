import { Spacer, Title, List, ListItem, Row, Col, Box, Label, Button, ElementGroup } from '3oilerplate'
import { useContext, useEffect, useState } from 'react'
import { IntelContext } from '../context/IntelContext'
import { Copy, Clipboard } from 'react-feather';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';


export const PlaylistStatus = () => {
  const { query: { id: playlistId } } = useRouter()
  const { getDataRes, me } = useContext(IntelContext)
  const [isCopied, setIsCopied] = useState(false)

  const playlistName = getDataRes?.name || getDataRes?.participations.map(({ user }: any) => user.name).join(' x ')
  const playlistDesc = getDataRes?.description || 'Generated with collabify.vercel.app'

  const shareUrl = `${window.location.host}/playlist/${playlistId}`

  const onCopy = () => {
    setIsCopied(true)
    copy(shareUrl)
  }

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false)
      }, 1000)
    }
  }, [isCopied])

  return (
    <Box s={{ display: 'grid', gridTemplateRows: 'auto', alignContent: 'center', gap: 'l' }}>
      <Spacer size="m">
        <Spacer size="s" s={{ alignItems: 'center' }}>
          <div><strong>Name</strong></div>
          <div>{ playlistName }</div>
        </Spacer>
        <Spacer size="s" s={{ alignItems: 'center' }}>
          <div><strong>Description</strong></div>
          <div>{ playlistDesc }</div>
        </Spacer>
        <Spacer size="s" s={{ alignItems: 'center' }}>
          <div><strong>Status</strong></div>
          <div><Label sRef="Label" isWaiting={getDataRes?.status === 'waiting'} isCompleted={getDataRes?.status === 'completed'}>{ getDataRes?.status }</Label></div>
        </Spacer>
      </Spacer>
      <Spacer>
        <List>
          { getDataRes?.participations.map(({ user }: any) => (
            <ListItem s={{ display: 'flex', justifyContent: 'space-between' }} key={user?.id}>{user?.name} <strong>{user.id === me.id ? 'You' : ''}</strong></ListItem>
          )) || [] }
        </List>
      </Spacer>
      <Spacer size="s" s={{ display: 'grid', textAlign: 'center', width: '100%' }}>
        {/* <div><strong>Invite your friends</strong></div> */}
        <ElementGroup s={{ '> *': { borderRadius: 'm' }, overflow: 'hidden', minWidth: '100%' }}>
          <Label s={{ p: 's', bg: 'backgroundDark', border: 0, flexGrow: 1, justifyContent: 'space-between', overflowX: 'auto' }}>
            <span>{ shareUrl }</span>
          </Label>
          <Button s={{ py: 'xs', px: 's' }} onClick={onCopy}>
            { isCopied ? <Clipboard /> : <Copy /> }
          </Button>
        </ElementGroup>
      </Spacer>
    </Box>
  )
}
