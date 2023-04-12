export const CONFIG = {
  PORT: process.env.PORT || 1337,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/collabify',
};

export const NEST_CONFIG = () => ({
  port: parseInt(process.env.PORT, 10) || 1337,
  // database: {
  //   host: process.env.DATABASE_HOST,
  //   port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  // },
});
