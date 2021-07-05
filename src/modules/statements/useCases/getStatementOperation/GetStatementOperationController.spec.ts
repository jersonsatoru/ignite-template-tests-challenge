import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import request from 'supertest';
import getConnection from '../../../../database';
import { app } from '../../../../app';

let connection: Connection;

describe('Get statement operation controller', () => {
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

  it('Should be able to get the statement operation', async () => {
    const responseAuth = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      });

    const { token } = await responseAuth.body;

    const responseStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `bearer ${token}`)
      .send({
        amount: 500,
        description: 'Batata frita',
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseStatement.body.id}`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('type');
  });

  it('Should not be able to get the statement operation unauthorized', async () => {
    const response = await request(app).get(`/api/v1/statements/${v4()}`);
    expect(response.status).toBe(401);
  });

  it('Should not be able to get the statement operation from a nonexistent statement', async () => {
    const responseAuth = await request(app)
      .post('/api/v1/sessions')
      .set('Content-type', 'application/json')
      .send({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      });

    const { token } = await responseAuth.body;

    const response = await request(app)
      .get(`/api/v1/statements/${v4()}`)
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(404);
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
  });
});
