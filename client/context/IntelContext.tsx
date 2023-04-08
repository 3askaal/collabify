import React, { createContext, Dispatch, SetStateAction, useState } from 'react'
import useAxios from "axios-hooks";
import { IData } from '../../types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';

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

  const [{ data: res }, submitDataCallback] = useAxios(
    {
      url: `${API_URL}/${playlistId}`,
      method: 'PUT'
    },
    { manual: true }
  )

  const submitData = () => {
    submitDataCallback({
      data: {
        userId: '???',
        data: data
      }
    })
  }

  return (
    <IntelContext.Provider
      value={{
        data,
        setData
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
