import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import useAxios from "axios-hooks";
import { faker } from '@faker-js/faker';
import { IData, IPlaylist, IUser } from '../../types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';
import { formatData } from '../helpers';
import useSpotifyApi from '../hooks/useSpotifyApi';

export interface IntelContextType {
  data?: IData;
  setData?: Dispatch<SetStateAction<IData>>;
  [key: string]: any;
}

export const IntelContext = createContext<IntelContextType>({
  data: {},
  setData: () => null
})

export const IntelProvider = ({ children }: any) => {
  const { push, query: { id: playlistId } } = useRouter()
  const { spotifyApi, refreshToken } = useSpotifyApi()
  const [name, setName] = useState<string>('')
  const [me, setMe] = useState<Partial<IUser>>({})
  const [data, setData] = useState<IData>({})
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

  const [{ data: getDataRes }, getDataCallback] = useAxios<IPlaylist>(
    playlistId ? {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'GET'
    } : {},
    { manual: true }
  )

  const [{ data: releaseRes }, release] = useAxios(
    playlistId ? {
      url: `${API_URL}/playlist/${playlistId}/release`,
      method: 'GET'
    } : {},
    { manual: true }
  )

  const submitData = () => {
    const participations = [{ user: me, data: data }]

    if (debugData) {
      participations.push({ user: { name: faker.name.fullName(), id: faker.datatype.uuid(), email: faker.internet.email() }, data: debugData })
    }

    submitDataCallback({
      data: {
        name,
        participations,
        invitations,
      }
    })
  }

  useEffect(() => {
    if (!spotifyApi || !refreshToken) return;

    spotifyApi.getMe().then((data) => {
      setMe({
        id: data.body.id,
        email: data.body.email,
        name: data.body.display_name,
        refreshToken
      })
    })
  }, [spotifyApi, refreshToken])

  useEffect(() => {
    if (submitDataRes) {
      push(`${submitDataRes._id}`)
    }
  }, [submitDataRes])

  useEffect(() => {
    if (me?.id && getDataRes?.participations.some(({ user }) => user.id === me?.id)) {
      setHasParticipated(true)
    }
  }, [getDataRes, submitDataRes, me])

  useEffect(() => {
    if (playlistId && playlistId !== 'new') {
      getDataCallback()
    }
  }, [playlistId])

  useEffect(() => {
    if (releaseRes) {
      console.log(releaseRes)
    }
  }, [releaseRes])

  return (
    <IntelContext.Provider
      value={{
        setName,
        data,
        setData,
        me,
        setMe,
        submitData,
        release,
        setDebugData,
        getDataRes,
        hasParticipated,
        setHasParticipated,
        invitations,
        setInvitations
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
