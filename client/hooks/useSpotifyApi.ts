import React, { useEffect } from "react";
import axios from 'axios';
import SpotifyWebApi from "spotify-web-api-node";
import { useLocalStorage } from "usehooks-ts";
import moment from "moment";
import { useRouter } from "next/router";

const spotifyApi: any = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

const getExpiresAt = (expiresIn: string) => moment().add(Number(expiresIn), 'seconds').valueOf().toString()

interface SpotifyApiHook {
  accessToken: string | null;
  refreshToken: string | null;
  spotifyApi: SpotifyWebApi;
  logout: Function;
}

export default function useSpotifyApi(code?: string): SpotifyApiHook {
  const router = useRouter()
  const [accessToken, setAccessToken] = useLocalStorage<string | null>('accessToken', '')
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>('refreshToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')

  const getRefreshToken = () => {
    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/refresh`, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setExpiresAt(getExpiresAt(res.data.expiresIn))
      })
      .catch(onError)
  }

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
    router.replace('/');
  }

  const onError = () => {
    logout();
  }

  useEffect(() => {
    if (accessToken) {
      spotifyApi.setAccessToken(accessToken)
    }
  }, [accessToken])

  useEffect(() => {
    if (!code) return

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth`, { code })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresAt(getExpiresAt(res.data.expiresIn))
      })
      .catch(onError)
  }, [code, setAccessToken, setRefreshToken, setExpiresAt])


  useEffect(() => {
    if (!expiresAt) return

    let interval: ReturnType<typeof setInterval>

    const isExpired = moment() > moment(Number(expiresAt))

    if (isExpired) {
      getRefreshToken()
    } else {
      const expiresIn = moment(Number(expiresAt)).valueOf() - moment().valueOf()
      interval = setInterval(getRefreshToken, expiresIn)
    }

    return () => clearInterval(interval)
  }, [expiresAt])

  return {
    spotifyApi: !!accessToken && spotifyApi,
    accessToken,
    refreshToken,
    logout,
  }
}
