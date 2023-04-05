import React, { createContext, Dispatch, SetStateAction, useState } from 'react'

export interface Terms {
  short_term: any[];
  medium_term: any[];
  long_term: any[];
}

export interface Intel {
  artists?: Terms;
  tracks?: Terms;
  genres?: Terms;
}

export interface IntelContextType {
  intel?: Intel;
  setIntel?: Dispatch<SetStateAction<Intel>>;
  [key: string]: any;
}

export const IntelContext = createContext<IntelContextType>({
  intel: {},
  setIntel: () => null
})

export const IntelProvider = ({ children }: any) => {
  const [intel, setIntel] = useState<Intel>({
    artists: { short_term: [], medium_term: [], long_term: [] },
    tracks: { short_term: [], medium_term: [], long_term: [] },
    genres: { short_term: [], medium_term: [], long_term: [] },
  })

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
