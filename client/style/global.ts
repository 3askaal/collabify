import { createGlobalStyle } from 'styled-components'

export const LocalGlobalStyle = createGlobalStyle({
  '*': {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  html: {
    height: '100vh',
    display: 'block',
  },

  'body, body > div': {
    height: '100%',
    display: 'block',
  },

  a: {
    textDecoration: 'none',
  }
})
