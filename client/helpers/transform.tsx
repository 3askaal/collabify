import { IPlaylist } from "../../server/types/playlist"

export const getDefaultPlaylistTitle = (playlist: IPlaylist | undefined) => {
  return playlist?.participations?.map(({ user }: any) => user.name).join(' x ') || '';
}
