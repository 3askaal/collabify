import { IPlaylist } from "../../server/types/playlist"

export const getDefaultPlaylistTitle = (playlist: IPlaylist) => {
  return playlist?.participations.map(({ user }: any) => user.name).join(' x ');
}
