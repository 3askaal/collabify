import { to } from 'await-to-js';
import fetch, { RequestInit } from 'node-fetch';
import { getAccessToken } from './getAccessToken';
import { CONFIG } from '../../config';

export const request = async (path: string, options?: RequestInit) => {
  const accessToken = await getAccessToken();

  return to(
    fetch(`${CONFIG.SC.BASE_URL}/${path}`, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
        ...options?.headers,
      },
      ...options,
    }),
  );
};
