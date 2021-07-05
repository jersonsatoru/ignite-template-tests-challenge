import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import request from 'supertest';
import createConnection from '../../../../database';
import { app } from '../../../../app';

let connection: Connection;

describe('Create user controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    const password = await hash('234234', 8);
    await connection.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1,$2,$3,$4)',
      [v4(), 'jersonsatoru@yahoo.com.br', 'Jerson', password]
    );
  });

  it('Should be able to create an user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'jersonsatoru@gmail.com',
        name: 'Jerson Uyekita',
        password: '234234',
      });

    expect(response.status).toBe(201);
  });

  it('Should not be able to create an user with an email already taken', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        name: 'Jerson Uyekita',
        password: '234234',
      });

    expect(response.status).toBe(400);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
