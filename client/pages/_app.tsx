import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { s, ThemeProvider, GlobalStyle, theme as DEFAULT_THEME } from '3oilerplate'
import ReactGA from 'react-ga4'
import deepmerge from 'deepmerge'
import { Layout } from '../components/layout'
import useSpotifyApi from '../hooks/useSpotifyApi'
import { IntelProvider } from '../context/IntelContext'
import { THEME, LocalGlobalStyle } from '../style'

import 'reset-css/reset.css'
import '../fonts.css'

ReactGA.initialize('G-B4GVQFN1MH', {
  testMode: process?.env?.NODE_ENV !== 'production'
})

export const SApp = s.div(() => ({
  fontFamily: 'base',
  width: '100%',
  height: '100%',
  backgroundColor: 'background',
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
  const { query: { id, code }, replace } = useRouter();
  const { accessToken } = useSpotifyApi(code?.toString())

  useEffect(() => {
    if (id === undefined && !code) return

    if (accessToken) {
      replace('/playlist/new');
    }
  }, [accessToken])

  return (
    <ThemeProvider theme={mergeTheme(DEFAULT_THEME, THEME)}>
      <IntelProvider>
        <DynamicWrapper>
          <SApp>
            <GlobalStyle />
            <LocalGlobalStyle />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SApp>
        </DynamicWrapper>
      </IntelProvider>
    </ThemeProvider>
  )
}
