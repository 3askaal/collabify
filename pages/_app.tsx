import type { AppProps } from 'next/app'
import { ThemeProvider, GlobalStyle, theme as DEFAULT_THEME } from '3oilerplate'
import deepmerge from 'deepmerge'
import { THEME, LocalGlobalStyle } from '../style'

import 'reset-css/reset.css'

function mergeTheme (baseTheme: any, theme: any) {
  return deepmerge(
    baseTheme,
    theme,
    { arrayMerge: (srcArray, overrideArray) => overrideArray }
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={mergeTheme(DEFAULT_THEME, THEME)}>
      <GlobalStyle />
      <LocalGlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
