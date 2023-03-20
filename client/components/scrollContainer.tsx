import { s, Box } from '3oilerplate';

export const SScrollContainer = s.div(({ theme }: any) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  height: '100%',
  overflow: 'hidden',

  '&:before': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: "''",
    height: '1rem',
    background: `-webkit-linear-gradient(${theme.colors.background} 10%, transparent)`,
  },

  '&:after': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    content: "''",
    height: '1rem',
    background: `-webkit-linear-gradient(transparent, ${theme.colors.background} 90%)`,
  }
}))

export const ScrollContainer = ({ children }: any) => {
  return (
    <SScrollContainer>
      <Box db s={{ overflowY: 'auto', py: 'm' }}>
        { children }
      </Box>
    </SScrollContainer>
  )
}
