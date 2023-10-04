import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { CONFIG } from '../../config';

export const getSpotifyInstanceByAccessToken = async (accessToken: AccessToken): Promise<SpotifyApi> => {
  return SpotifyApi.withAccessToken(process.env.SPOTIFY_API_CLIENT_ID, accessToken);
};

export const sdk = SpotifyApi.withClientCredentials(
  CONFIG.SPTFY.CLIENT_ID as string,
  CONFIG.SPTFY.CLIENT_SECRET as string,
);
