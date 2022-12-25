import { createGlobalStyle } from 'styled-components'

export const LocalGlobalStyle = createGlobalStyle({
  '*': {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  body: {
    height: '100%',
    minHeight: '100vh',
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
