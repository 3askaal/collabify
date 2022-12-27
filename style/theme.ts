import { darken } from '3oilerplate'

export const fonts = {
  base: "'Cabin', sans-serif",
  title: "'Cabin', sans-serif",
  logo: "'Courgette', sans-serif",
}

const PRIMARY = '#FB2576'
const SECONDARY = '#D61C4E'

export const THEME = {
  colors: {
    primary: PRIMARY,
    primaryDark: darken(PRIMARY, 0.5),
    secondary: '#000',
    secondaryDark: darken('#000', 0.5),
    background: '#212121',
    color: darken('#fff', 0.75)
  },
  components: {
    Button: {
      default: {
        background: 'transparent'
      }
    },
    Label: {
      default: {
        border: '2px solid primary',
        background: 'transparent',
        borderRadius: '30px',
        borderWidth: '2px',
        padding: 's',
        cursor: 'pointer'
      }
    },
    Input: {
      default: {
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadius: 0,
        minWidth: '100%',
        px: 0,
      }
    },
    Radio: {
      default: {
        color: 'white'
      }
    }
  },
  fonts
}
