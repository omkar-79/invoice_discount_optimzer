import request from 'supertest';
import app from '../src/app';

describe('App (e2e)', () => {
  it('/health (GET)', () => {
    return request(app)
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
      });
  });

  it('/api/auth/register (POST)', () => {
    return request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
      });
  });

  it('/api/auth/login (POST)', () => {
    return request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
      });
  });

  it('/api/rates/today (GET)', () => {
    return request(app)
      .get('/api/rates/today')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('asOf');
        expect(res.body).toHaveProperty('benchmark');
        expect(res.body.benchmark).toHaveProperty('name');
        expect(res.body.benchmark).toHaveProperty('annualRatePct');
        expect(res.body.benchmark).toHaveProperty('deltaBpsDay');
      });
  });
});
