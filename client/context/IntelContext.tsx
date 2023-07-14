import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import useAxios from "axios-hooks";
import { faker } from '@faker-js/faker';
import { IData, IExcludeData, IParticipations, IPlaylist, IUser } from '../../server/types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';
import useSpotifyApi from '../hooks/useSpotifyApi';

interface IDetails {
  title?: string;
  description?: string;
  refreshEvery?: string;
}

export interface IntelContextType {
  data: IData;
  setData: Dispatch<SetStateAction<IData>>;
  excludeData: IExcludeData;
  setExcludeData: Dispatch<SetStateAction<IExcludeData>>;
  details: IDetails;
  setDetails: Dispatch<SetStateAction<IDetails>>;
  [key: string]: any;
}

export const IntelContext = createContext<IntelContextType>({
  data: {},
  setData: () => null,
  excludeData: {},
  setExcludeData: () => null,
  details: { title: '', description: '' },
  setDetails: () => null,
})

export const IntelProvider = ({ children }: any) => {
  const { push, query: { id: playlistId } } = useRouter()
  const { spotifyApi, accessToken, refreshToken } = useSpotifyApi()

  const [me, setMe] = useState<IUser | null>(null)
  const [details, setDetails] = useState<IDetails>({})
  const [data, setData] = useState<IData>({})
  const [excludeData, setExcludeData] = useState<IExcludeData>({})
  const [debugData, setDebugData] = useState<IData | null>(null)
  const [hasParticipated, setHasParticipated] = useState<boolean>(false)
  const [invitations, setInvitations] = useState<string[]>([])

  const [{ data: submitDataRes }, submitDataCallback] = useAxios<IPlaylist>(
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

  const [{ data: getPlaylistRes }, getPlaylistCallback] = useAxios<IPlaylist>(
    {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'GET'
    },
    { manual: true }
  )

  const [{ data: getPlaylistsRes }, getPlaylistsCallback] = useAxios<IPlaylist>(
    {
      url: `${API_URL}/playlist/all/${me?.id}/${me?.email}`,
      method: 'GET'
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

  const submitData = () => {
    if (!me) return;

    const participations: IParticipations = [{
      user: {
        ...me,
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

    submitDataCallback({
      data: {
        ...details,
        participations,
        invitations,
      }
    })
  }

  useEffect(() => {
    if (!accessToken || !refreshToken || !spotifyApi) return;

    spotifyApi.getMe()
      .then(
        (data) => {
          setMe({
            id: data.body.id,
            email: data.body.email,
            name: data.body.display_name || '',
            ...(playlistId === 'new' && {
              refreshToken
            })
          })
        },
        (err: any) => {
          console.log('ERROR: ', err); // eslint-disable-line
          return
        }
      )
  }, [accessToken, refreshToken, spotifyApi, playlistId])

  useEffect(() => {
    console.log('getPlaylistRes: ', getPlaylistRes); // eslint-disable-line
    if (me?.id && getPlaylistRes?.participations?.some(({ user }) => user.id === me?.id)) {
      setHasParticipated(true)
    }
  }, [getPlaylistRes, submitDataRes, me])

  useEffect(() => {
    if (playlistId && playlistId !== 'new') {
      getPlaylistCallback()
    }
  }, [playlistId])

  // useEffect(() => {
  //   if (me?.id && me?.email) {
  //     getPlaylistsCallback()
  //   }
  // }, [me, getPlaylistsCallback])

  useEffect(() => {
    console.log('collectDataRes: ', collectDataRes);
  }, [collectDataRes])

  useEffect(() => {
    if (submitDataRes) {
      push(`${submitDataRes._id}`)
    }
  }, [submitDataRes])

  useEffect(() => {
    console.log('releaseRes: ', releaseRes);
  }, [releaseRes])

  useEffect(() => {
    console.log('refreshRes: ', refreshRes);
  }, [refreshRes])

  return (
    <IntelContext.Provider
      value={{
        details,
        setDetails,
        data,
        setData,
        excludeData,
        setExcludeData,
        me,
        setMe,
        submitData,
        collect,
        release,
        refresh,
        setDebugData,
        hasParticipated,
        setHasParticipated,
        invitations,
        setInvitations,
        getPlaylistRes,
        getPlaylistsRes,
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
