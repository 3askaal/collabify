import { Button } from '3oilerplate'
import Link from 'next/link'

export function Login() {
  return (
    <>
      <Link href="/api/login">
        <Button>Authenticate with Spotify</Button>
      </Link>
    </>
  )
}
