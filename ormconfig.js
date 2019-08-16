module.exports = {
  name: 'default',
  type: 'postgres',
  host: process.env.ORM_HOST,
  port: process.env.ORM_PORT,
  username: process.env.ORM_USER,
  password: process.env.ORM_PASS,
  database: process.env.ORM_DATABASE,
  synchronize: true,
  logging: false,

  entities: [process.env.NODE_ENV === 'production' ? 'dist/entity/**/*.js' : 'src/entity/**/*.ts'],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migration/**/*.js' : 'src/migration/**/*.ts'],
  subscribers: [process.env.NODE_ENV === 'production' ? 'dist/subscriber/**/*.js' : 'src/subscriber/**/*.ts'],

  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
