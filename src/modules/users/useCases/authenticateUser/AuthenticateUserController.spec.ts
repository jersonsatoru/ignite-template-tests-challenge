import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import request from 'supertest';
import { v4 } from 'uuid';
import { app } from '../../../../app';
import getConnection from '../../../../database';

let connection: Connection;

describe('Authenticate user controller', () => {
  beforeAll(async () => {
    connection = await getConnection();
    const password = await hash('234234', 8);
    await connection.runMigrations();
    await connection.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4)',
      [v4(), 'jersonsatoru@yahoo.com.br', 'Jerson', password]
    );
  });

  it('Should not be able to authenticate with wrong credentials', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        password: '234234',
        email: 'jersonsatoru@yahoo.com',
      });

    expect(response.status).toBe(401);

    const response2 = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        password: '2342341',
        email: 'jersonsatoru@yahoo.com.br',
      });

    expect(response2.status).toBe(401);
  });

  it('Should be able to authenticate user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        password: '234234',
        email: 'jersonsatoru@yahoo.com.br',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
