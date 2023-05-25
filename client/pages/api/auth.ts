// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import SpotifyApi from 'spotify-web-api-node'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const code = req.body.code

  const spotifyApi = new SpotifyApi({
    redirectUri: `${process.env.NEXT_PUBLIC_PROD_URL}`,
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_API_SECRET_ID,
  })

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch((err) => {
      console.log('api/auth ERR: ', err)
      res.send(400)
    })
}
