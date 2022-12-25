import { useRouter } from 'next/router'
import { Box, Wrapper, Spacer, Title } from '3oilerplate'
import Login from '../components/login'
import Logo from '../components/logo'
import CollectIntelAuthenticated from '../components/collectIntelAuthenticated'

export default function Home() {
  const router = useRouter()
  const code = router.query.code

  return (
    <>
      <Wrapper>
        <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
          <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo />
            <p>Make smarter collaborative playlists.</p>
          </Spacer>
          { code ? <CollectIntelAuthenticated code={code} /> : <Login />}
        </Spacer>
      </Wrapper>
    </>
  )
}
