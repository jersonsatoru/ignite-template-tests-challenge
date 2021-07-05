import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import request from 'supertest';
import getConnection from '../../../../database';
import { app } from '../../../../app';

let connection: Connection;

describe('Create statement controller', () => {
  beforeAll(async () => {
    connection = await getConnection();
  });

  beforeEach(async () => {
    await connection.runMigrations();
    const password = await hash('234234', 8);
    await connection.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4)',
      [v4(), 'jersonsatoru@yahoo.com.br', 'Jerson', password]
    );
  });

  it('Should be authenticated to create a statement', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw');
    expect(response.status).toBe(401);
  });

  it('Should be able to do a deposit', async () => {
    const responseAuth = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      });

    const { token } = await responseAuth.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 100,
        description: 'Batata frita',
      });

    expect(response.status).toBe(201);
  });

  it('Should not be able to do a withdraw greater than the balance', async () => {
    const responseAuth = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      });

    const { token } = await responseAuth.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 100,
        description: 'Batata frita',
      });

    expect(response.status).toBe(400);
  });

  it('Should be able to do a withdraw', async () => {
    const responseAuth = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      });

    const { token } = await responseAuth.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 500,
        description: 'Batata frita',
      });

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 100,
        description: 'Batata frita',
      });

    expect(response.status).toBe(201);
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
  });
});
