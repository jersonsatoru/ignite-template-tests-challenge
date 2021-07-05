module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: process.env.DB_NAME,
  entities: ['./src/modules/**/entities/*.ts'],
  migrations: ['./src/database/migrations/*.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
  },
};
