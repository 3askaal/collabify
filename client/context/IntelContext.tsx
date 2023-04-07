import React, { createContext, Dispatch, SetStateAction, useState } from 'react'
import useAxios from "axios-hooks";
import { IPlaylistIntelData } from '../../types/playlist'
import { API_URL } from '../config';
import { useRouter } from 'next/router';

export interface IntelContextType {
  intel?: IPlaylistIntelData;
  setIntel?: Dispatch<SetStateAction<IPlaylistIntelData>>;
  [key: string]: any;
}

export const IntelContext = createContext<IntelContextType>({
  intel: {},
  setIntel: () => null
})

export const IntelProvider = ({ children }: any) => {
  const { query: { id: playlistId } } = useRouter()
  const [intel, setIntel] = useState<IPlaylistIntelData>({
    artists: { short_term: [], medium_term: [], long_term: [] },
    tracks: { short_term: [], medium_term: [], long_term: [] },
    genres: { short_term: [], medium_term: [], long_term: [] },
  })

  const [{ data }, submitIntelCallback] = useAxios(
    {
      url: `${API_URL}/${playlistId}`,
      method: 'PUT'
    },
    { manual: true }
  )

  const submitIntel = () => {
    submitIntelCallback({
      data: {
        userId: '???',
        data: intel
      }
    })
  }

  return (
    <IntelContext.Provider
      value={{
        intel,
        setIntel
      }}
    >
      {children}
    </IntelContext.Provider>
  )
}
