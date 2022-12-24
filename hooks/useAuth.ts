import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useHistory } from "react-router";

export default function useAuth(code: string): string {
  const history = useHistory()
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [expiresIn, setExpiresIn] = useState()

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

  return accessToken
}
