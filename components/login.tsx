import { Wrapper, Container, Button } from '3oilerplate'
import Link from 'next/link'

export default function Login() {
  return (
    <>
      <Link href="/api/login">
        <Button>Authenticate with Spotify</Button>
      </Link>
    </>
  )
}
