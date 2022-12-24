import { Inter } from '@next/font/google'
import { Wrapper, Container, Button } from '3oilerplate'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Login() {
  return (
    <>
      <Wrapper>
        <Container>
          <Link href="/api/login">
            <Button>Authenticate with Spotify</Button>
          </Link>
        </Container>
      </Wrapper>
    </>
  )
}
