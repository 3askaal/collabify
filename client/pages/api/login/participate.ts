// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { stringify as generateQueryString } from 'querystring'
import { generate as generateRandomString } from 'randomstring'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const state = generateRandomString(16);

  res.redirect(
    'https://accounts.spotify.com/authorize?' +
    generateQueryString({
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID,
      scope: [
        'user-read-email',
        'user-top-read'
      ].join(' '),
      redirect_uri: process.env.NEXT_PUBLIC_PROD_URL,
      state: state,
    })
  )
}