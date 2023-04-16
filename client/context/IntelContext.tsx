import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import useAxios from "axios-hooks";
import { IData } from '../../types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';
import { formatData } from '../helpers';

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
  const { query: { id: playlistId } } = useRouter()
  const [data, setData] = useState<IData>({})
  const [debugData, setDebugData] = useState<IData | null>(null)

  const [{ data: submitDataRes }, submitDataCallback] = useAxios(
    playlistId === 'new' ? {
      url: `${API_URL}/playlist`,
      method: 'POST'
    } : {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'PUT'
    },
    { manual: true }
  )

  const [{ data: getDataRes }, getDataCallback] = useAxios(
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
    const participations = [{ userId: '???', data: data }]

    if (debugData) {
      participations.push({ userId: '???', data: debugData })
    }

    submitDataCallback({
      data: {
        participations
      }
    })
  }

  useEffect(() => {
    if (submitDataRes) {
      console.log(submitDataRes)
    }
  }, [submitDataRes])

  useEffect(() => {
    if (playlistId && playlistId !== 'new') {
      getDataCallback()
    }
  }, [playlistId])

  useEffect(() => {
    if (getDataRes) {
      console.log(getDataRes)
    }
  }, [getDataRes])

  useEffect(() => {
    if (releaseRes) {
      console.log(releaseRes)
    }
  }, [releaseRes])

  return (
    <IntelContext.Provider
      value={{
        data,
        setData,
        submitData,
        release,
        setDebugData
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
