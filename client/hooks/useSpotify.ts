import { useEffect, useState } from 'react'
import { SpotifyApi, AuthorizationCodeWithPKCEStrategy } from "@spotify/web-api-ts-sdk"
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import moment from 'moment';
import to from 'await-to-js';

const getExpiresAt = (expiresIn: number): string => moment().add(expiresIn, 'seconds').valueOf().toString()

export default function useSpotify() {
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);
  const [shouldAuthenticate, setShouldAuthenticate] = useState(false)
  const [accessToken, setAccessToken] = useLocalStorage<any>('accessToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')
  const [redirectPlaylistId, setRedirectPlaylistId] = useLocalStorage<string | null>('redirectPlaylistId', '')
  const { query: { id: playlistId, code }, replace } = useRouter()

  useEffect(() => {
    if (!shouldAuthenticate && !code) return

    (async () => {
      const auth = new AuthorizationCodeWithPKCEStrategy(
        process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID as string,
        `${process.env.NEXT_PUBLIC_PROD_URL}`,
        [
          'user-read-email',
          'user-top-read',
          'playlist-modify-public',
          'playlist-modify-private'
        ]
      );

      const internalSdk = new SpotifyApi(auth, {});

      const [authError, authSuccess] = await to(internalSdk.authenticate());

      if (authError) {
        if (authError && authError.message && authError.message.includes("No verifier found in cache")) {
          console.error("If you are seeing this error in a React Development Environment it's because React calls useEffect twice. Using the Spotify SDK performs a token exchange that is only valid once, so React re-rendering this component will result in a second, failed authentication. This will not impact your production applications (or anything running outside of Strict Mode - which is designed for debugging components).", authError);
        } else {
          console.error(authError);
        }
      }

      if (authSuccess?.authenticated) {
        setSdk(() => internalSdk);
      }
    })();
  }, [shouldAuthenticate, code]);

  useEffect(() => {
    if (!sdk) return;

    (async () => {
      const accessToken = await sdk.getAccessToken();

      if (accessToken) {
        setAccessToken(accessToken)
        setExpiresAt(getExpiresAt(accessToken.expires_in))
        replace(`/playlist/${redirectPlaylistId || 'new'}`);
      }
    })()
  }, [sdk])

  useEffect(() => {
    if (!accessToken && playlistId && playlistId !== 'new') {
      setRedirectPlaylistId(playlistId as string)
    }
  }, [playlistId, accessToken])

  useEffect(() => {
    if (!expiresAt) return

    let interval: ReturnType<typeof setInterval>

    const isExpired = moment() > moment(Number(expiresAt))

    if (isExpired) {
      // getRefreshToken()
      console.log('isExpired!'); // eslint-disable-line
    } else {
      const expiresIn = moment(Number(expiresAt)).valueOf() - moment().valueOf()
      interval = setInterval(() => console.log('isExpired cb!'), expiresIn)
    }

    return () => clearInterval(interval)
  }, [expiresAt])

  const login = async () => {
    setShouldAuthenticate(true);
  }

  const logout = () => {
    sdk?.logOut();
    setShouldAuthenticate(false);
    setAccessToken(null);
    setExpiresAt(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresAt');
    replace('/');
  }

  return {
    sdk,
    accessToken,
    login,
    logout
  };
}
