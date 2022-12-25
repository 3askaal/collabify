import { useRouter } from 'next/router'
import { Wrapper, Spacer } from '3oilerplate'
import Login from '../components/login'
import Logo from '../components/logo'
import { useEffect } from 'react'
import useSpotifyApi from '../hooks/useSpotifyApi'
import Steps from '../components/steps'

export default function Home() {
  const router = useRouter()
  const code = router.query.code
  const { accessToken } = useSpotifyApi(code?.toString())

  useEffect(() => {
    if (code) {
      router.replace('/playlist/new', undefined, { shallow: true });
    }
  }, [code])

  return (
    <>
      <Wrapper>
        <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
          <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo />
            <p>Create smarter collaborative playlists.</p>
          </Spacer>
          { accessToken ? null : <Login /> }
        </Spacer>
      </Wrapper>
    </>
  )
}
