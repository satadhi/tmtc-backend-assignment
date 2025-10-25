// Mock Redis before anything else
jest.mock('../config/redisClient', () => ({
  client: {
    setEx: jest.fn().mockResolvedValue(null),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(null),
  },
}));

// Mock email sending
jest.mock('../config/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(null),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let token;

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

  // Login to get token
  const login = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 't@t.com', password: 'Pass123!' });

  token = login.body.token;
  expect(token).toBeDefined();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Itineraries CRUD', () => {
  test('create -> get -> update -> delete flow', async () => {
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
    expect(get.body.destination).toBe('Paris');

    // Update itinerary
    const upd = await request(app)
      .put(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Updated' });
    expect(upd.statusCode).toBe(200);
    expect(upd.body.title).toBe('Updated');

    // Negative test: get with invalid ID
    const invalidGet = await request(app)
      .get('/api/itineraries/invalid-id')
      .set('Authorization', `Bearer ${token}`);
    expect(invalidGet.statusCode).toBe(400); // Or 404 depending on your API
    expect(invalidGet.body.message).toBeDefined();

    const nonExistentGet = await request(app)
      .get('/api/itineraries/64fc4d92242114c8ea7118ff') // random valid ObjectId format
      .set('Authorization', `Bearer ${token}`);
    expect(nonExistentGet.statusCode).toBe(404);
    expect(nonExistentGet.body.message).toBeDefined();

    // Delete itinerary
    const del = await request(app)
      .delete(`/api/itineraries/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });

  test('pagination, filtering, and sorting', async () => {
    // Seed multiple itineraries
    const destinations = ['Paris', 'Rome', 'Paris', 'Berlin', 'Rome'];
    for (let i = 0; i < destinations.length; i++) {
      await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send({
          title: `Trip ${i}`,
          destination: destinations[i],
          startDate: new Date(Date.now() + i * 86400000).toISOString(),
          endDate: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
          activities: [],
        });
    }

    // Test pagination (limit=2)
    const page1 = await request(app)
      .get('/api/itineraries?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);
    expect(page1.statusCode).toBe(200);
    expect(page1.body.items.length).toBeLessThanOrEqual(2);

    const page2 = await request(app)
      .get('/api/itineraries?page=2&limit=2')
      .set('Authorization', `Bearer ${token}`);
    expect(page2.statusCode).toBe(200);
    expect(page2.body.items.length).toBeLessThanOrEqual(2);

    // Test filtering (?destination=Paris)
    const filtered = await request(app)
      .get('/api/itineraries?destination=Paris')
      .set('Authorization', `Bearer ${token}`);
    expect(filtered.statusCode).toBe(200);
    expect(filtered.body.items.every((it) => it.destination === 'Paris')).toBe(true);

    // Test sorting (?sort=startDate)
    const sorted = await request(app)
      .get('/api/itineraries?sort=startDate:asc')
      .set('Authorization', `Bearer ${token}`);
    expect(sorted.statusCode).toBe(200);
    const dates = sorted.body.items.map((it) => new Date(it.startDate));
    const isSorted = dates.every((d, i, arr) => !i || arr[i - 1] <= d);
    expect(isSorted).toBe(true);
  });
});
