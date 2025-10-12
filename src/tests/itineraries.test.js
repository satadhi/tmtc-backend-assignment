const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
jest.setTimeout(20000);
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = require('../app');

  // Create test user
  await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'application/json')
    .send({ email: 't@t.com', password: 'Pass123!' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Itineraries CRUD', () => {
  test('create -> get -> update -> delete flow', async () => {
    // Login to get token
    const login = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 't@t.com', password: 'Pass123!' });

    const token = login.body.token;
    expect(token).toBeDefined();

    const payload = {
      title: 'Trip',
      destination: 'Paris',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      activities: [{ time: '09:00', description: 'Visit', location: 'Eiffel' }],
    };

    // Create itinerary
    const create = await request(app)
      .post('/api/itineraries')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(payload);
    expect(create.statusCode).toBe(201);
    const id = create.body._id;

    // Get itinerary
    const get = await request(app)
      .get(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.statusCode).toBe(200);

    // Update itinerary
    const upd = await request(app)
      .put(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Updated' });
    expect(upd.statusCode).toBe(200);

    // Delete itinerary
    const del = await request(app)
      .delete(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });
});
