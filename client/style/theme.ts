import { darken, brighten } from '3oilerplate'

export const fonts = {
  base: "'Cabin', sans-serif",
  title: "'Cabin', sans-serif",
  logo: "'Courgette', sans-serif",
}

const PRIMARY = '#865DFF'
const SECONDARY = '#E90064'

const SUCCESS = '#59CE8F'

export const THEME = {
  rootFontSizes: {
    rootFontSizes: ['14px', '16px'],
  },
  colors: {
    primary: PRIMARY,
    primaryDark: darken(PRIMARY, .5),
    primaryLight: brighten(PRIMARY, 1),
    secondary: SECONDARY,
    secondaryDark: darken(SECONDARY, 1),
    secondaryLight: brighten(SECONDARY, 1.5),
    background: '#212121',
    color: darken('#fff', 0.75),
    success: SUCCESS
  },
  components: {
    Button: {
      default: {
        borderRadius: '5rem',
        px: 'm',
        // background: `-webkit-linear-gradient(${brighten(PRIMARY, 1.5)}, ${PRIMARY}) !important`,
        // color: 'primaryDark'
      }
    },
    Label: {
      default: {
        background: 'transparent',
      },
      variants: {
        isSelection: {
          color: 'grey60',
          border: '2px solid',
          borderColor: 'grey60',
          borderRadius: '5rem',
          padding: 'xs',
          cursor: 'pointer',

          '> p': {
            color: 'grey40',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
        isSelected: {
          color: 'primary',
          borderColor: 'primary',
          borderWidth: '2px',
          userSelect: 'none',

          '> p': {
            color: 'white',
          }
        },
        isWaiting: {
          borderColor: 'grey30',
          color: 'grey30',
          display: 'inline-flex',
          px: 'xs',
          py: 'xxs'
        },
        isCompleted: {
          borderColor: 'success',
          color: 'success',
          display: 'inline-flex',
          px: 'xs',
          py: 'xxs'
        }
      }
    },
    Input: {
      default: {
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadius: 0,
        minWidth: '100%',
        borderWidth: '1px',
        px: 0,
      }
    }
  },
  fonts
}
