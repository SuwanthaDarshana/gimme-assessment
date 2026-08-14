import request from 'supertest';
import { createApp } from './src/app.js';
import { getDb } from './src/db.js';

const app = createApp();

beforeAll(() => {
  const db = getDb();
  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');
  db.prepare(`
    INSERT INTO listings (id, title, category, price, condition, description, image, specifications, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 'Test Chair', 'Furniture', 100, 'Good', 'A test chair.', null, '{}', new Date().toISOString());
});

describe('GET /listings', () => {
  it('returns paginated listings with meta', async () => {
    const res = await request(app).get('/listings');
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1 });
  });
});

describe('POST /listings', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).post('/listings').send({});
    expect(res.status).toBe(401);
  });
});