import { Box, Title } from '3oilerplate'

export default function Logo({ small }: any) {
  return (
    <Title s={{ fontFamily: 'logo', fontSize: small ? '2rem' : '3.5rem' }}>
      <Box dif s={{ color: 'grey30' }}>Collab</Box>ify
    </Title>
  )
}
