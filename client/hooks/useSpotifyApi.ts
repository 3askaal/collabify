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

export default function useSpotifyApi(code?: string): { accessToken: string | null, spotifyApi: SpotifyWebApi, logout: Function } {
  const router = useRouter()
  const [accessToken, setAccessToken] = useLocalStorage<string | null>('accessToken', '')
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>('refreshToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')

  useEffect(() => {
    if (router.pathname !== '/' && !accessToken) {
      router.replace('/')
    } else {
      spotifyApi.setAccessToken(accessToken)
    }

  }, [accessToken, router.pathname])

  useEffect(() => {
    if (!code) return

    console.log('gets new access token'); // eslint-disable-line

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth`, { code })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresAt(getExpiresAt(res.data.expiresIn))
      })
      .catch((err) => {
        (window as any).location = '/'
        console.log('ERR: ', err)
      })
  }, [code, setAccessToken, setRefreshToken, setExpiresAt])

  const getRefreshToken = () => {
    console.log('call getRefreshToken');

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/refresh`, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setExpiresAt(getExpiresAt(res.data.expiresIn))
      })
      .catch((err) => {
        (window as any).location = '/'
        console.log('ERR: ', err)
        // history.push('/')
      })
  }

  useEffect(() => {
    if (!expiresAt) return

    let interval: ReturnType<typeof setInterval>

    const isExpired = moment() > moment(Number(expiresAt))
    console.log('isExpired: ', isExpired); // eslint-disable-line

    if (isExpired) {
      getRefreshToken()
    } else {
      const expiresIn = moment(Number(expiresAt)).valueOf() - moment().valueOf()
      const expiresInMinutes = moment(Number(expiresAt)).diff(moment(), 'minutes')

      console.log('expiresIn: ', expiresIn); // eslint-disable-line
      console.log('expiresInMinutes: ', expiresInMinutes); // eslint-disable-line

      interval = setInterval(getRefreshToken, expiresIn)
    }

    return () => clearInterval(interval)
  }, [expiresAt])

  const logout = () => {
    console.log('call logout'); // eslint-disable-line
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
  }

  return {
    spotifyApi: !!accessToken && spotifyApi,
    accessToken,
    logout,
  }
}
