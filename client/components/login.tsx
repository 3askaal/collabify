import { Button } from '3oilerplate'
import Link from 'next/link'

export function Login() {
  return (
    <>
      <Link href="/api/login/create">
        <Button>Authenticate with Spotify</Button>
      </Link>
    </>
  )
}
