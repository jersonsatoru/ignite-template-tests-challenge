import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import { app } from '../../../../app';
import createConnection from '../../../../database';

let conn: Connection;

describe('Show user profile controller', () => {
  beforeAll(async () => {
    conn = await createConnection();
    await conn.runMigrations();
    const password = await hash('234234', 8);
    await conn.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4)',
      [v4(), 'jersonsatoru@yahoo.com.br', 'Jerson', password]
    );
  });

  it('Should be able to show a profile from user', async () => {
    const responseAuth = await request(app).post('/api/v1/sessions').send({
      email: 'jersonsatoru@yahoo.com.br',
      password: '234234',
    });

    const { token } = responseAuth.body;

    const response = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
  });

  it('Should not be able to show a profile from user without authentication', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `bearer 234123345sdf`);

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    await conn.dropDatabase();
    await conn.close();
  });
});
