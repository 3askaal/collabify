// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { stringify as generateQueryString } from 'querystring'
import { generate as generateRandomString } from 'randomstring'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const state = generateRandomString(16);

  res.redirect(
    'https://accounts.spotify.com/authorize?' +
    generateQueryString({
      response_type: "code",
      client_id: process.env.SPOTIFY_API_CLIENT_ID,
      scope: 'user-read-private user-read-email user-top-read',
      redirect_uri: `${process.env.BASE_URL}/callback`,
      state: state,
    })
  )
}
