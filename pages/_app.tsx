import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { s, ThemeProvider, GlobalStyle, theme as DEFAULT_THEME } from '3oilerplate'
import deepmerge from 'deepmerge'
import ReactGA from 'react-ga4'
import { THEME, LocalGlobalStyle } from '../style'
import useSpotifyApi from '../hooks/useSpotifyApi'

import 'reset-css/reset.css'
import '../fonts.css'
import { useEffect } from 'react'

ReactGA.initialize('G-B4GVQFN1MH', {
  testMode: process?.env?.NODE_ENV !== 'production'
})

export const SApp = s.div(() => ({
  fontFamily: 'base',
  backgroundColor: 'background',
  width: '100%',
  color: 'color'
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
  const router = useRouter()
  const code = router.query.code
  const { accessToken } = useSpotifyApi(code?.toString())

  useEffect(() => {
    if (accessToken) {
      router.push('/playlist/new');
    }
  }, [accessToken, code])

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
