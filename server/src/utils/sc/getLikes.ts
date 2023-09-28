import { request } from './request';
import { getUser } from './getUser';

const limit = 1000;

const getLikesBy = async (userId: string, type: string) => {
  let href = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

  const likes: any = [];

  while (href) {
    const [err, success] = await request(href);

    if (err) {
      throw err;
    }

    const res = (await success.json()) as any;

    href = res.next_href && res.next_href.split('https://api.soundcloud.com/')[1];

    likes.push(...res.collection);
  }

  return likes;
};

export const getLikes = async (permalink: string) => {
  const profile = await getUser(permalink);

  let likes: any = [];

  const tracks = await getLikesBy(profile.id, 'tracks');
  const playlists = await getLikesBy(profile.id, 'playlists');

  likes = [...likes, ...tracks];
  likes = [...likes, ...playlists];

  return likes.map(({ kind, title, genre, user }) => ({
    kind,
    title,
    ...(genre && {
      genre,
    }),
    user: user.username,
  }));
};
