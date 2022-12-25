import type { AppProps } from 'next/app'
import { s, ThemeProvider, GlobalStyle, theme as DEFAULT_THEME } from '3oilerplate'
import deepmerge from 'deepmerge'
import dynamic from 'next/dynamic'

import 'reset-css/reset.css'
import '../fonts.css'
import { THEME, LocalGlobalStyle } from '../style'
import useSpotifyApi from '../hooks/useSpotifyApi'
import { useRouter } from 'next/router'

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
