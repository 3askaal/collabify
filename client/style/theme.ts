import { darken } from '3oilerplate'

export const fonts = {
  base: "'Cabin', sans-serif",
  title: "'Cabin', sans-serif",
  logo: "'Courgette', sans-serif",
}

const PRIMARY = '#FB2576'
const SECONDARY = '#D61C4E'

const SUCCESS = '#59CE8F'

export const THEME = {
  rootFontSizes: {
    rootFontSizes: ['14px', '16px'],
  },
  colors: {
    primary: PRIMARY,
    primaryDark: darken(PRIMARY, 0.5),
    secondary: '#000',
    secondaryDark: darken('#000', 0.5),
    background: '#212121',
    color: darken('#fff', 0.75),
    success: SUCCESS
  },
  components: {
    Button: {
      default: {
        // background: 'transparent'
      },
      variants: {
        isTermSelector: {
          paddingY: 'xs',
          paddingX: 's'
        }
      }
    },
    Label: {
      default: {
        background: 'transparent',
      },
      variants: {
        isSelected: {
          color: 'primary',
          border: '2px solid',
          borderColor: 'primary',
          borderRadius: '30px',
          borderWidth: '2px',
          padding: 'xs',
          cursor: 'pointer',
          userSelect: 'none',

          '> p': {
            color: 'grey20',
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
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
