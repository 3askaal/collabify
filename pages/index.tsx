import { useRouter } from 'next/router'
import { Wrapper } from '3oilerplate'
import Dashboard from '../components/dashboard'
import Login from '../components/login'

export default function Home() {
  const router = useRouter()
  const code = router.query.code

  return (
    <>
      <Wrapper>
        { code ? <Dashboard code={code} /> : <Login />}
      </Wrapper>
    </>
  )
}
