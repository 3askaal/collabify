import React, { useContext, useEffect, useState } from "react";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useLocalStorage } from "usehooks-ts";
import moment from "moment";
import { useRouter } from "next/router";
import { useSpotify } from "./useSpotify";

const getExpiresAt = (expiresIn: number): string => moment().add(expiresIn, 'seconds').valueOf().toString()

interface SpotifyApiHook {
  accessToken?: AccessToken;
  sdk: SpotifyApi | null;
  login: Function;
  logout: Function;
}

export default function useSpotifyApi(): SpotifyApiHook {
  const { query: { id: playlistId }, replace } = useRouter()
  const [accessToken, setAccessToken] = useLocalStorage<any>('accessToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')
  const [redirectPlaylistId, setRedirectPlaylistId] = useLocalStorage<string | null>('redirectPlaylistId', '')
  const [shouldAuthenticate, setShouldAuthenticate] = useState(false)

  const sdk = useSpotify(
    shouldAuthenticate,
    process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID as string,
    `${process.env.NEXT_PUBLIC_PROD_URL}`,
    [
      'user-read-email',
      'user-top-read',
      'playlist-modify-public',
      'playlist-modify-private'
    ]
  )

  const login = async () => {
    setShouldAuthenticate(true);
  }

  const logout = () => {
    setShouldAuthenticate(false);
    sdk!.logOut();
    setAccessToken(null);
    setExpiresAt(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresAt');
    replace('/');
  }

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

  // const onError = () => {
  //   logout();
  // }

  // useEffect(() => {
  //   if (accessToken) {
  //     setRedirectPlaylistId(null)
  //   }
  // }, [accessToken])

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

  return {
    sdk,
    accessToken,
    login,
    logout,
  }
}
