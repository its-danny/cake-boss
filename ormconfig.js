module.exports = {
  name: "default",
  type: "postgres",
  host: process.env.ORM_HOST,
  port: process.env.ORM_PORT,
  username: process.env.ORM_USER,
  password: process.env.ORM_PASS,
  database: process.env.ORM_DATABASE,
  synchronize: false,
  logging: false,

  entities: [process.env.NODE_ENV === "production" ? "dist/src/entity/**/*.js" : "src/entity/**/!(*.test.ts)"],
  migrations: [process.env.NODE_ENV === "production" ? "dist/src/migration/**/*.js" : "src/migration/**/!(*.test.ts)"],
  subscribers: [process.env.NODE_ENV === "production" ? "dist/src/subscriber/**/*.js" : "src/subscriber/**/!(*.test.ts)"],

  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};
