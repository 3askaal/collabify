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

  const submitData = () => {
    submitDataCallback({
      data: {
        participations: [{
          userId: '???',
          data: formatData(data)
        }]
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

  return (
    <IntelContext.Provider
      value={{
        data,
        setData,
        submitData
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
