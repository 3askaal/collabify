export const API_URL =
  process?.env?.NODE_ENV === 'production'
    ? 'https://collabify.herokuapp.com'
    : 'http://localhost:1337'
