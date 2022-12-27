import { Wrapper, Spacer } from '3oilerplate'
import Login from '../components/login'
import Logo from '../components/logo'

export default function Home() {
  return (
    <>
      <Wrapper>
        <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
          <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo />
            <p>Generate Smart Collaborative Playlists</p>
          </Spacer>
          <Login />
        </Spacer>
      </Wrapper>
    </>
  )
}
