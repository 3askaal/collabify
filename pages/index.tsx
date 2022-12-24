import { Inter } from '@next/font/google'
import { Wrapper, Container, Button } from '3oilerplate'
import { useFetch } from 'usehooks-ts'
import { useState } from 'react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [openLogin, setOpenLogin] = useState(false)
  const { data, error } = useFetch<any[]>(openLogin ? '/api/login' : '')

  return (
    <>
      <Wrapper>
        <Container>
          {/* login to share your spotify data */}
          {/* <Button onClick={() => setOpenLogin(true)}>Login</Button> */}
          <Link href="/api/login">Login</Link>
        </Container>
        <Container>
          {/* title of your playlist */}
        </Container>
        <Container>
          {/* is your friend/crush willing to share their spotify data? */}
        </Container>
        <Container>
          {/* if yes, create document in db and generate shareable link */}
        </Container>
        <Container>
          {/* if no, show page with song/artist/album/genre inputs */}
        </Container>
      </Wrapper>
    </>
  )
}
