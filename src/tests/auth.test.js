const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
afterEach(async () => {
  await User.deleteMany({});
});
describe('Auth', () => {
  test('register -> login', async () => {
    const email = `u${Date.now()}@test.com`;
    const pass = 'Pass123!';
    const res = await request(app).post('/api/auth/register').send({ email, password: pass });
    expect(res.statusCode).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email, password: pass });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});
