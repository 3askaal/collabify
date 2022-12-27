import { createGlobalStyle } from 'styled-components'

export const LocalGlobalStyle = createGlobalStyle({
  '*': {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  html: {
    minHeight: '100vh',
  },

  'html, body, body > div': {
    height: '100%',
  },

  // svg: {
  //   display: 'block',
  //   stroke: 'currentcolor !important'
  // },

  // button: {
  //   appearance: 'none',
  //   outline: '0',
  //   '-webkit-tap-highlight-color': 'transparent',
  // },

  a: {
    textDecoration: 'none',
  }
})
