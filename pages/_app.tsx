import type { AppProps } from 'next/app'
import { s, ThemeProvider, GlobalStyle, theme as DEFAULT_THEME } from '3oilerplate'
import deepmerge from 'deepmerge'
import { THEME, LocalGlobalStyle } from '../style'

import 'reset-css/reset.css'
import '../fonts.css'
import dynamic from 'next/dynamic'

export const SApp = s.div(() => ({
  fontFamily: 'base',
  backgroundColor: 'background',
  width: '100%',
  height: '100%',
  flexGrow: 1,
}))

function mergeTheme (baseTheme: any, theme: any) {
  return deepmerge(
    baseTheme,
    theme,
    { arrayMerge: (srcArray, overrideArray) => overrideArray }
  )
}

const NonSSRWrapper = ({ children }: any) => (
  <>{children}</>
)

const DynamicWrapper = dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={mergeTheme(DEFAULT_THEME, THEME)}>
      <DynamicWrapper>
        <SApp>
          <GlobalStyle />
          <LocalGlobalStyle />
          <Component {...pageProps} />
        </SApp>
      </DynamicWrapper>
    </ThemeProvider>
  )
}
