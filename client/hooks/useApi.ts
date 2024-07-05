import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAxios from 'axios-hooks';
import { faker } from '@faker-js/faker';
import to from 'await-to-js';
import { map, sampleSize } from 'lodash';
import { API_URL } from '../config';
import { IData, IParticipations, IPlaylist } from '../../server/types/playlist';
import { DataContext } from '../context/DataContext';
import useSpotify from './useSpotify';

// const getExpiresAt = (expiresIn: number): string => moment().add(expiresIn, 'seconds').valueOf().toString()

export default function useApi() {
  const { query: { id: playlistId }, push } = useRouter();
  const { accessToken } = useSpotify();
  const { currentUser, data, setData, excludeData, debugData, setDebugData, config, invitations } = useContext(DataContext);

  const [{ data: collectDataRes }, collectCallback] = useAxios<IData>(
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

  const [{ data: submitRes }, submitCallback] = useAxios<IPlaylist>(
    playlistId === 'new' ? {
      url: `${API_URL}/playlist`,
      method: 'POST'
    } : {
      url: `${API_URL}/playlist/${playlistId}`,
      method: 'PUT'
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

  const collect = async (debug?: boolean) => {
    const [collectErr, collectSuccess] = await to(collectCallback({ data: { accessToken } }));

    if (collectErr) throw collectErr;

    setData(collectSuccess.data);

    if (debug) {
      const seed_tracks = map(sampleSize(collectSuccess.data.tracks?.short_term, 3), 'id').map((id) => id.split(':')[2]);
      const [collectDebugErr, collectDebugSuccess] = await to(collectCallback({ data: { accessToken, seed_tracks, debug: true } }));

      if (collectDebugErr) throw collectDebugErr;

      setDebugData(collectDebugSuccess.data);
    }
  }

  const submit = () => {
    if (!currentUser) return;
    if (!data) return;

    const participations: IParticipations = [{
      user: {
        ...currentUser,
        accessToken
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
    if (submitRes) {
      push(`${submitRes._id}`)
    }
  }, [submitRes])

  return {
    collect,
    release,
    refresh,
    submit,
    playlist,
    playlists,
  };
}
