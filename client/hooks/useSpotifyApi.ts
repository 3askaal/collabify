import React, { useCallback, useEffect } from "react";
import axios from 'axios';
import SpotifyWebApi from "spotify-web-api-node";
import { useLocalStorage } from "usehooks-ts";
import moment from "moment";

const spotifyApi: any = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

const getExspiresAt = (expiresIn: string) => moment().add(Number(expiresIn), 'seconds').toDate().getTime().toString()

export default function useSpotifyApi(code?: string): { accessToken: string | null, spotifyApi: SpotifyWebApi, logout: Function } {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>('accessToken', '')
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>('refreshToken', '')
  const [expiresAt, setExpiresAt] = useLocalStorage<string | null>('expiresAt', '')

  useEffect(() => {
    if (!accessToken) return

    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    // if (accessToken) return
    if (!code) return

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth`, { code })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresAt(getExspiresAt(res.data.expiresIn))
      })
      .catch((err) => {
        (window as any).location = '/'
        console.log('ERR: ', err)
      })
  }, [code, accessToken])

  const getRefreshToken = () => {
    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/refresh`, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setExpiresAt(getExspiresAt(res.data.expiresIn))
      })
      .catch((err) => {
        (window as any).location = '/'
        console.log('ERR: ', err)
        // history.push('/')
      })
  }

  useEffect(() => {
    if (!refreshToken) return
    if (!expiresAt) return

    let interval: NodeJS.Timer

    const isExpired = moment() > moment(Number(expiresAt))

    if (isExpired) {
      getRefreshToken()
    } else {
      const expiresIn = moment(Number(expiresAt)).valueOf() - moment().valueOf()
      interval = setInterval(() => getRefreshToken, expiresIn)
    }

    return () => clearInterval(interval)
  }, [refreshToken, expiresAt])

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
