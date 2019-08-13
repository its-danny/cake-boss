import { createConnections, getConnection } from 'typeorm';

export default async () => {
  await createConnections();

  const connection = await getConnection('test');
  await connection.dropDatabase();
  await connection.runMigrations();
};
