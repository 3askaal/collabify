import React, { useContext, useEffect, useState } from "react";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useLocalStorage } from "usehooks-ts";
import moment from "moment";
import { useRouter } from "next/router";

const getExpiresAt = (expiresIn: number): string => moment().add(expiresIn, 'seconds').valueOf().toString()

interface SpotifyApiHook {
  accessToken?: AccessToken;
  sdk: SpotifyApi;
  login: Function;
  logout: Function;
}

const sdk = SpotifyApi.withUserAuthorization(
  process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID as string,
  `${process.env.NEXT_PUBLIC_PROD_URL}`,
  [
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private'
  ]
)

export default function useSpotifyApi(): SpotifyApiHook {
  const { query: { code }, replace } = useRouter()
  const [accessToken, setAccessToken] = useLocalStorage<any>('accessToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')
  const [redirectPlaylistId, setRedirectPlaylistId] = useLocalStorage<string | null>('redirectPlaylistId', '')

  const login = async () => {
    await sdk.authenticate()
    const accessToken = await sdk.getAccessToken();

    if (accessToken) {
      setAccessToken(accessToken)
      setExpiresAt(getExpiresAt(accessToken.expires_in))
      replace(`/playlist/${redirectPlaylistId || 'new'}`);
    }
  }

  const logout = () => {
    setAccessToken(null);
    setExpiresAt(null);
    sdk.logOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresAt');
    replace('/');
  }

  // const onError = () => {
  //   logout();
  // }

  useEffect(() => {
    if (code) {
      login()
    }
  }, [code])

  // useEffect(() => {
  //   if (accessToken) {
  //     setRedirectPlaylistId(null)
  //   }
  // }, [accessToken])

  // useEffect(() => {
  //   if (!accessToken && playlistId && playlistId !== 'new') {
  //     setRedirectPlaylistId(playlistId as string)
  //   }
  // }, [playlistId, accessToken])

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
