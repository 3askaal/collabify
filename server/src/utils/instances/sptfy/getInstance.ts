import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';

export const getSpotifyInstanceByAccessToken = async (accessToken: AccessToken): Promise<SpotifyApi> => {
  return SpotifyApi.withAccessToken(process.env.SPOTIFY_API_CLIENT_ID, accessToken);
};
