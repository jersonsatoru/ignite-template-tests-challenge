import { Connection, createConnection } from 'typeorm';

export default async function getConnection(): Promise<Connection> {
  const conn = await createConnection();
  await import('../shared/container');
  return conn;
}
