import { Inter } from '@next/font/google'
import { Wrapper, Container } from '3oilerplate'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Wrapper>
        <Container>
          {/* login to share your spotify data */}
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
