import { useRouter } from 'next/router'
import { Wrapper } from '3oilerplate'
import Login from '../components/login'
import CollectIntelAuthenticated from '../components/collectIntelAuthenticated'

export default function Home() {
  const router = useRouter()
  const code = router.query.code

  return (
    <>
      <Wrapper>
        { code ? <CollectIntelAuthenticated code={code} /> : <Login />}
      </Wrapper>
    </>
  )
}
