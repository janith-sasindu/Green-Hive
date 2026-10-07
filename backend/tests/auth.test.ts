import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/config/db';
import { authHeader, createFarmer } from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

const sellerSignUp = {
  role: 'SELLER',
  name: 'Amara Wickramasinghe',
  businessName: 'Colombo Fresh Market',
  email: 'Amara@ColomboFresh.test',
  phone: '+94 71 234 5678',
  password: 'correct-horse-battery',
  location: 'Colombo 07',
};

beforeAll(resetTestDatabase);
afterAll(closeTestDatabase);

describe('POST /api/auth/register', () => {
  it('creates a seller account and returns a token', async () => {
    const response = await request(app).post('/api/auth/register').send(sellerSignUp);

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      name: 'Amara Wickramasinghe',
      email: 'amara@colombofresh.test',
      role: 'SELLER',
      isVerified: false,
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('stores a bcrypt hash instead of the password', async () => {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE email = ?', ['amara@colombofresh.test']);
    const hash = (rows as { password_hash: string }[])[0].password_hash;

    expect(hash).not.toContain(sellerSignUp.password);
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it('rejects an email that is already registered', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...sellerSignUp, email: 'amara@colombofresh.test' });

    expect(response.status).toBe(409);
  });

  it('reports every invalid field', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ role: 'SELLER', name: '', email: 'not-an-email', phone: '12345', password: 'short' });

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.errors).sort()).toEqual(['businessName', 'email', 'name', 'password', 'phone']);
  });

  it('does not allow self registration as an administrator', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...sellerSignUp, email: 'admin@greenhive.test', role: 'ADMIN' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('role');
  });
});

describe('POST /api/auth/login', () => {
  it('signs in with the right password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amara@colombofresh.test', password: sellerSignUp.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amara@colombofresh.test', password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@greenhive.test', password: 'wrong-password' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });
});

describe('protected routes', () => {
  it('returns the signed-in user from /api/auth/me', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amara@colombofresh.test', password: sellerSignUp.password });

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('amara@colombofresh.test');
  });

  it('rejects a missing or invalid token', async () => {
    const missing = await request(app).get('/api/seller/profile');
    const invalid = await request(app).get('/api/seller/profile').set('Authorization', 'Bearer not.a.token');

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
  });

  it('blocks other roles from seller routes', async () => {
    const farmer = await createFarmer();

    const response = await request(app).get('/api/seller/profile').set(authHeader(farmer));

    expect(response.status).toBe(403);
  });
});
