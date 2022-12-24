import { Inter } from '@next/font/google'
import { Wrapper, Container } from '3oilerplate'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Dashboard from '../components/dashboard'
import Login from '../components/login'

const inter = Inter({ subsets: ['latin'] })

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
