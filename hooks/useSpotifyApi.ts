import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useHistory } from "react-router";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi: any = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID
})

export default function useSpotifyApi(code: string): { accessToken: string, spotifyApi: SpotifyWebApi } {
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [expiresIn, setExpiresIn] = useState()

  useEffect(() => {
    if (!accessToken) return

    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!code || accessToken) return

    axios
      .post(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth`, { code })
      .then((res) => {
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresIn(res.data.expiresIn)
      })
      .catch((err) => {
        console.log('ERR: ', err)
        // history.push('/')
      })
  }, [code, accessToken])


  useEffect(() => {
    if (!refreshToken || !expiresIn) return

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

    }, (expiresIn - 60) * 1000)

    return () => clearInterval(interval)
  }, [refreshToken, expiresIn])

  return {
    spotifyApi: !!accessToken && spotifyApi,
    accessToken
  }
}
