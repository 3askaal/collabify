import dotenvJSON from 'complex-dotenv-json';
dotenvJSON({ path: './env.json' });

export const CONFIG = {
  SC: JSON.parse(process.env.SC || ''),
  SPTFY: JSON.parse(process.env.SPTFY || ''),
};
