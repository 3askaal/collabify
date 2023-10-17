import React, { createContext, useState } from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { IConfig, IData, IExcludeData, IUser } from '../../server/types/playlist'

export interface DataContextType {
  [key: string]: any;
}

export const DataContext = createContext<DataContextType>({})

export const DataProvider = ({ children }: any) => {
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [data, setData] = useState<IData>();
  const [debugData, setDebugData] = useState<IData>();
  const [excludeData, setExcludeData] = useState<IExcludeData>({});
  const [config, setConfig] = useState<IConfig>({ size: 'm', recommendations: false });
  const [invitations, setInvitations] = useState<string[]>([]);

  return (
    <DataContext.Provider
      value={{
        sdk,
        setSdk,
        currentUser,
        setCurrentUser,
        config,
        setConfig,
        data,
        setData,
        debugData,
        setDebugData,
        excludeData,
        setExcludeData,
        invitations,
        setInvitations,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
