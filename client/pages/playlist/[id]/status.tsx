import { useContext } from 'react'
import { Box, Wrapper, Container, Button, Spacer } from '3oilerplate'
import { User as UserIcon } from 'react-feather'
import { Logo } from '../../../components';
import useSpotifyApi from '../../../hooks/useSpotifyApi'
import { IntelContext } from '../../../context/IntelContext'

export default function Status() {
  const { logout } = useSpotifyApi()
  const { release } = useContext(IntelContext)

  return (
    <>
      <Wrapper s={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 'm' }}>

        <Box df w100p jcc>
          <Logo small />
        </Box>

        <Box posa r='0' t='0' s={{ p: 'm' }}>
          <Button isOutline onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
            <UserIcon size="14" />
          </Button>
        </Box>

        <Container s={{ maxWidth: '480px', justifyContent: 'center', flexGrow: 1, overflowY: 'hidden', my: 'm' }}>
          <Spacer>
            <Button onClick={release}>Release</Button>
          </Spacer>
        </Container>

      </Wrapper>
    </>
  )
}
