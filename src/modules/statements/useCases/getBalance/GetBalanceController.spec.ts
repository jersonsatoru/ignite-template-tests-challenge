import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import request from 'supertest';
import getConnection from '../../../../database';
import { app } from '../../../../app';

let connection: Connection;

describe('Get balance controller', () => {
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

  it('Should be able to get the balance', async () => {
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

    await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 100,
        description: 'Batata frita',
      });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body.balance).toBe(400);
  });

  it('Should not be able to get the balance unauthorized', async () => {
    const response = await request(app).get('/api/v1/statements/balance');

    expect(response.status).toBe(401);
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
  });
});
