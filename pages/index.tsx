import { useRouter } from 'next/router'
import { Box, Wrapper, Spacer, Title } from '3oilerplate'
import Login from '../components/login'
import Logo from '../components/logo'
import CollectIntelAuthenticated from '../components/collectIntelAuthenticated'
import { useEffect, useState } from 'react'
import useSpotifyApi from '../hooks/useSpotifyApi'

export default function Home() {
  const router = useRouter()
  const code = router.query.code
  const { accessToken } = useSpotifyApi(code?.toString())
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (accessToken) {
      router.replace('/', undefined, { shallow: true });
    }
  }, [accessToken])

  return (
    <>
      <Wrapper>
        <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
          <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo />
            <p>Create smarter collaborative playlists.</p>
          </Spacer>
          { accessToken ? <CollectIntelAuthenticated /> : <Login /> }
        </Spacer>
      </Wrapper>
    </>
  )
}
