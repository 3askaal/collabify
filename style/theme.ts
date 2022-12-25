import { darken } from '3oilerplate'

export const fonts = {
  base: "'Cabin', sans-serif",
  logo: "'Courgette', sans-serif",
}

const PRIMARY = '#D61C4E'
const SECONDARY = '#D61C4E'

export const THEME = {
  colors: {
    primary: PRIMARY,
    primaryDark: darken(PRIMARY, 0.5),
    secondary: '#000',
    secondaryDark: darken('#000', 0.5),
    background: '#293462',
    color: darken('#fff', 0.75)
  },
  components: {
    Label: {
      default: {
        border: '2px solid primary',
        background: 'transparent',
        color: 'primary',
        borderRadius: '20px'
      }
    }
  },
  fonts
}
