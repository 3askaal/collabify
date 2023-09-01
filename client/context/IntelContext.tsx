import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import useAxios, { RefetchFunction } from "axios-hooks";
import { faker } from '@faker-js/faker';
import { IConfig, IData, IExcludeData, IParticipations, IPlaylist, IUser } from '../../server/types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';
import useSpotifyApi from '../hooks/useSpotifyApi';

export interface IntelContextType {
  data: IData | null;
  setData: Dispatch<SetStateAction<IData>>;
  excludeData: IExcludeData;
  setExcludeData: Dispatch<SetStateAction<IExcludeData>>;
  setDebugData: Dispatch<SetStateAction<IData | undefined>>;
  setCurrentUser?: Dispatch<SetStateAction<IUser | undefined>>;
  config: IConfig;
  currentUser?: IUser;
  setConfig: Dispatch<SetStateAction<IConfig>>;
  invitations: string[];
  setInvitations: Dispatch<SetStateAction<string[]>>;
  collect?: RefetchFunction<any, IData>;
  submit?: () => void;
  release?: RefetchFunction<any, IPlaylist>;
  refresh?: RefetchFunction<any, IPlaylist>;
  playlist?: IPlaylist;
  playlists?: IPlaylist[];
}

export const IntelContext = createContext<IntelContextType>({
  data: null,
  setData: () => undefined,
  excludeData: {},
  setExcludeData: () => undefined,
  setDebugData: () => undefined,
  config: { size: 'm', recommendations: false },
  setConfig: () => undefined,
  invitations: [],
  setInvitations: () => undefined,
})

export const IntelProvider = ({ children }: any) => {
  const [data, setData] = useState<IData>({})
  const [excludeData, setExcludeData] = useState<IExcludeData>({})
  const [debugData, setDebugData] = useState<IData>()
  const [config, setConfig] = useState<IConfig>({ size: 'm', recommendations: false })
  const [currentUser, setCurrentUser] = useState<IUser>()
  const [invitations, setInvitations] = useState<string[]>([])

  const { push, query: { id: playlistId } } = useRouter()
  const { sdk, accessToken } = useSpotifyApi()

  const [{ data: submitDataRes }, submitCallback] = useAxios<IPlaylist>(
    playlistId === 'new' ? {
      url: `${API_URL}/playlist`,
      method: 'POST'
    } : {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'PUT'
    },
    { manual: true }
  )

  const [{ data: collectDataRes }, collect] = useAxios<IData>(
    {
      url: `${API_URL}/playlist/collect`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: playlist }, getPlaylistCallback] = useAxios<IPlaylist>(
    {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'GET'
    },
    { manual: true }
  )

  const [{ data: playlists }, getPlaylistsCallback] = useAxios<IPlaylist[]>(
    {
      url: `${API_URL}/playlist/all`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: releaseRes }, release] = useAxios(
    playlistId ? {
      url: `${API_URL}/playlist/${playlistId}/release`,
      method: 'GET'
    } : {},
    { manual: true }
  )

  const [{ data: refreshRes }, refresh] = useAxios(
    playlistId ? {
      url: `${API_URL}/playlist/${playlistId}/refresh`,
      method: 'GET'
    } : {},
    { manual: true }
  )

  const submit = () => {
    if (!currentUser) return;
    if (!data) return;

    const participations: IParticipations = [{
      user: {
        ...currentUser,
      },
      data,
      excludeData
    }]

    if (debugData) {
      participations.push({
        user: {
          id: faker.datatype.uuid().toString(),
          name: 'AI',
          email: faker.internet.email(),
          bot: true
        },
        data: debugData
      })
    }

    submitCallback({
      data: {
        ...config,
        participations,
        invitations,
      }
    })
  }

  useEffect(() => {
    if (!accessToken) return;
    if (!sdk) return;

    sdk.currentUser.profile()
      .then(
        (user) => {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.display_name || '',
            accessToken
          })
        }
      )
  }, [accessToken])

  useEffect(() => {
    if (!playlistId || playlistId === 'new') return;

    getPlaylistCallback()
  }, [submitDataRes, releaseRes, refreshRes, playlistId])

  // useEffect(() => {
  //   if (!currentUser) return;

  //   getPlaylistsCallback({
  //     data: {
  //       id: currentUser.id,
  //       email: currentUser.email
  //     }
  //   })
  // }, [currentUser])

  useEffect(() => {
    if (submitDataRes) {
      push(`${submitDataRes._id}`)
    }
  }, [submitDataRes])

  // useEffect(() => {
  //   console.log('collectDataRes: ', collectDataRes);
  // }, [collectDataRes])

  // useEffect(() => {
  //   console.log('playlists: ', playlists);
  // }, [playlists])

  // useEffect(() => {
  //   console.log('releaseRes: ', releaseRes);
  // }, [releaseRes])

  // useEffect(() => {
  //   console.log('refreshRes: ', refreshRes);
  // }, [refreshRes])

  return (
    <IntelContext.Provider
      value={{
        config,
        setConfig,
        data,
        setData,
        excludeData,
        setExcludeData,
        currentUser,
        collect,
        submit,
        release,
        refresh,
        setDebugData,
        invitations,
        setInvitations,
        playlist,
        playlists,
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
