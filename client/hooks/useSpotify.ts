import { useContext } from "react";
import { useRouter } from 'next/router';
import { SpotifyApi, AuthorizationCodeWithPKCEStrategy, AccessToken } from "@spotify/web-api-ts-sdk"
import { useLocalstorageState } from 'rooks';
import to from 'await-to-js';
import { DataContext } from "../context/DataContext";

export default function useSpotify() {
  const { replace } = useRouter();
  const [accessToken, setAccessToken] = useLocalstorageState<AccessToken | null>('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token', null)
  const [redirectPlaylistId] = useLocalstorageState<string | null>('redirectPlaylistId', '')
  const { sdk, setSdk, setCurrentUser } = useContext(DataContext);

  const login = async () => {
    const auth = new AuthorizationCodeWithPKCEStrategy(
      process.env.NEXT_PUBLIC_SPOTIFY_API_CLIENT_ID as string,
      `${process.env.NEXT_PUBLIC_PROD_URL}`,
      [
        'user-read-email',
        'user-top-read',
        'playlist-modify-public',
        'playlist-modify-private'
      ]
    );

    const internalSdk = new SpotifyApi(auth, {});

    const [authError, authSuccess] = await to(internalSdk.authenticate());

    if (authError) {
      if (authError && authError.message && authError.message.includes("No verifier found in cache")) {
        console.error("If you are seeing this error in a React Development Environment it's because React calls useEffect twice. Using the Spotify SDK performs a token exchange that is only valid once, so React re-rendering this component will result in a second, failed authentication. This will not impact your production applications (or anything running outside of Strict Mode - which is designed for debugging components).", authError);
      } else {
        console.error(authError);
      }
    }

    if (authSuccess?.authenticated) {
      setSdk(internalSdk);

      const [getProfileErr, getProfileSuccess] = await to(internalSdk.currentUser.profile())

      if (getProfileErr || !getProfileSuccess) {
        throw (getProfileErr || new Error('Something went wrong while fetching current user profile.'));
      }

      setCurrentUser({
        id: getProfileSuccess.id,
        email: getProfileSuccess.email,
        name: getProfileSuccess.display_name || ''
      })

      replace(`/playlist/${redirectPlaylistId || 'new'}`);
    }
  }

  const logout = () => {
    sdk?.logOut();
    setSdk(null);
    setAccessToken(null);
    replace('/');
  }

  return {
    accessToken,
    login,
    logout
  };
}
