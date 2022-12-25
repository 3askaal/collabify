import { Box, Title } from '3oilerplate'

export default function Logo({ small }: any) {
  return (
    <Title s={{ fontFamily: 'logo', fontSize: small ? '1.75rem' : '2.5rem' }}>
      <Box dif s={{ color: 'grey30' }}>Collab</Box>ify
    </Title>
  )
}
