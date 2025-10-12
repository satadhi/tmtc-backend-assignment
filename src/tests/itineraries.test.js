const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await request(app).post('/api/auth/register').send({ email: 't@t.com', password: 'Pass123!' });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
describe('Itineraries CRUD', () => {
  test('create -> get -> update -> delete flow', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@t.com', password: 'Pass123!' });
    const token = login.body.token;
    const payload = {
      title: 'Trip',
      destination: 'Paris',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      activities: [{ time: '09:00', description: 'Visit', location: 'Eiffel' }],
    };
    const create = await request(app)
      .post('/api/itineraries')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(create.statusCode).toBe(201);
    const id = create.body._id;
    const get = await request(app)
      .get(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.statusCode).toBe(200);
    const upd = await request(app)
      .put(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });
    expect(upd.statusCode).toBe(200);
    const del = await request(app)
      .delete(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  }, 20000);
});
