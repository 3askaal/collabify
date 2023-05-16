import { s, Box, Title } from '3oilerplate'

const SLogo = s.div(({ theme, c1, c2 }: any) => ({
  display: 'inline-flex',
  background: `-webkit-linear-gradient(${theme.colors[c1]}, ${theme.colors[c2]})`,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  userSelect: 'none',
}))

export function Logo({ small }: any) {
  return (
    <Title s={{ fontFamily: 'logo', fontSize: small ? '2.25rem' : '3.5rem' }}>
      <SLogo c1="primaryLight" c2="primary">Collab</SLogo>ify
    </Title>
  )
}
