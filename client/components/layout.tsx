import { Box, Wrapper, Container, Button } from '3oilerplate'
import { User as UserIcon } from 'react-feather'
import { Logo } from './logo'
import useSpotifyApi from '../hooks/useSpotifyApi'

export function Layout({ children }: any) {
  const { spotifyApi, logout } = useSpotifyApi()

  return (
    <Wrapper s={{ display: 'grid', gridTemplateRows: spotifyApi ? 'auto minmax(0, 1fr)' : 'auto', gridTemplateColumns: '1fr', justifyItems: 'center', gap: 'm' }}>
      {
        spotifyApi && (
          <>
            <Box df w100p jcc>
              <Logo small />
            </Box>

            <Box posa r='0' t='0' s={{ p: 'm' }}>
              <Button isOutline onClick={logout} s={{ p: 's', borderRadius: '100%' }}>
                <UserIcon size="14" />
              </Button>
            </Box>
          </>
        )
      }

      <Container s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', maxWidth: '480px' }}>
        { children }
      </Container>
    </Wrapper>
  )
}
