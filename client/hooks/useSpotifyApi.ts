import React, { useEffect } from "react";
import axios from 'axios';
import SpotifyWebApi from "spotify-web-api-node";
import { useLocalStorage } from "usehooks-ts";

const spotifyApi: any = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

export default function useSpotifyApi(code?: string): { accessToken: string | null, spotifyApi: SpotifyWebApi, logout: Function } {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>('accessToken', '')
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>('refreshToken', '')
  const [expiresIn, setExpiresIn] = useLocalStorage<string | null>('expiresIn', '')

  useEffect(() => {
    if (!accessToken) return

    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (accessToken) return
    if (!code) return

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth`, { code })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresIn(res.data.expiresIn)
      })
      .catch((err) => {
        console.log('ERR: ', err)
      })
  }, [code, accessToken])


  useEffect(() => {
    if (!refreshToken) return
    if (!expiresIn) return

    const interval = setInterval(() => {
      axios
        .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/refresh`, { refreshToken })
        .then((res) => {
          setAccessToken(res.data.accessToken)
          setExpiresIn(res.data.expiresIn)
        })
        .catch((err) => {
          console.log('ERR: ', err)
          // history.push('/')
        })

    }, (Number(expiresIn) - 60) * 1000)

    return () => clearInterval(interval)
  }, [refreshToken, expiresIn])

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setExpiresIn(null)
  }

  return {
    spotifyApi: !!accessToken && spotifyApi,
    accessToken,
    logout,
  }
}
