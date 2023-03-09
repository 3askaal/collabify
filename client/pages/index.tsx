import { Wrapper, Spacer } from '3oilerplate'
import { Login, Logo } from '../components'

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
