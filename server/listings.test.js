import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createApp } from './src/app.js';
import { getDb } from './src/db.js';
import { JWT_SECRET } from './src/middleware/auth.js';

const app = createApp();

let authToken;

beforeAll(async () => {
  const db = getDb();

  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');

  const passwordHash = await bcrypt.hash('testpass123', 10);
  const userResult = db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run(
    'testuser',
    passwordHash
  );

  authToken = jwt.sign({ sub: userResult.lastInsertRowid, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });

  const insertListing = db.prepare(`
    INSERT INTO listings (id, title, category, price, condition, description, image, specifications, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertListing.run(
    1,
    'Apple MacBook Pro 14"',
    'Electronics',
    1800,
    'Like New',
    'High performance laptop with M3 chip in pristine condition.',
    'https://example.com/macbook.jpg',
    JSON.stringify({ Brand: 'Apple', Storage: '512GB' }),
    '2026-08-01T10:00:00.000Z'
  );

  insertListing.run(
    2,
    'Ergonomic Office Desk Chair',
    'Furniture',
    250,
    'Good',
    'Mesh office chair with adjustable lumbar support and armrests.',
    'https://example.com/chair.jpg',
    JSON.stringify({ Brand: 'ErgoMax', Material: 'Mesh' }),
    '2026-08-02T10:00:00.000Z'
  );

  insertListing.run(
    3,
    'Sony Wireless Headphones',
    'Electronics',
    300,
    'New',
    'Brand new noise cancelling Bluetooth headphones in sealed packaging.',
    'https://example.com/sony.jpg',
    JSON.stringify({ Brand: 'Sony', Color: 'Black' }),
    '2026-08-03T10:00:00.000Z'
  );
});

describe('Health Check Endpoint', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Authentication API (/auth)', () => {
  it('POST /auth/login returns JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.username).toBe('testuser');
  });

  it('POST /auth/login returns 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /auth/register creates a new user and returns token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'newuser123', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.username).toBe('newuser123');
  });

  it('POST /auth/register returns 409 for duplicate username', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});

describe('Listings API (/listings)', () => {
  describe('GET /listings', () => {
    it('returns paginated listings with metadata', async () => {
      const res = await request(app).get('/listings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.meta).toMatchObject({
        total: 3,
        page: 1,
        limit: 12,
        totalPages: 1,
      });
    });

    it('filters listings by category', async () => {
      const res = await request(app).get('/listings?category=Furniture');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('Furniture');
      expect(res.body.meta.total).toBe(1);
    });

    it('filters listings by search query (q)', async () => {
      const res = await request(app).get('/listings?q=MacBook');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain('MacBook');
    });

    it('filters listings by minPrice and maxPrice', async () => {
      const res = await request(app).get('/listings?minPrice=200&maxPrice=500');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // Chair ($250) and Sony Headphones ($300)
    });

    it('sorts listings by price ascending', async () => {
      const res = await request(app).get('/listings?sortBy=price&order=asc');
      expect(res.status).toBe(200);
      expect(res.body.data[0].price).toBe(250);
      expect(res.body.data[res.body.data.length - 1].price).toBe(1800);
    });

    it('excludes a specific ID when excludeId query is provided', async () => {
      const res = await request(app).get('/listings?excludeId=1');
      expect(res.status).toBe(200);
      const ids = res.body.data.map((item) => item.id);
      expect(ids).not.toContain(1);
    });
  });

  describe('GET /listings/:id', () => {
    it('returns 200 and listing data for existing ID', async () => {
      const res = await request(app).get('/listings/1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.title).toBe('Apple MacBook Pro 14"');
      expect(res.body.data.specifications).toEqual({ Brand: 'Apple', Storage: '512GB' });
    });

    it('returns 404 for non-existent ID', async () => {
      const res = await request(app).get('/listings/9999');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('not found');
    });

    it('returns 400 for invalid non-numeric ID', async () => {
      const res = await request(app).get('/listings/invalid-id');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /listings', () => {
    it('returns 401 when token is missing', async () => {
      const res = await request(app).post('/listings').send({
        title: 'Unauthorized Item',
        category: 'Electronics',
        price: 100,
        condition: 'New',
        description: 'Testing unauthorized creation attempts.',
      });
      expect(res.status).toBe(401);
    });

    it('returns 400 with validation errors on invalid payload', async () => {
      const res = await request(app)
        .post('/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Missing title
          category: 'InvalidCategory', // Invalid category
          price: -50, // Negative price
          condition: 'Broken', // Invalid condition
          description: 'Short', // Under 10 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toBeDefined();
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('returns 201 and creates listing with valid data', async () => {
      const newListing = {
        title: 'Sony Alpha A7 IV Camera',
        category: 'Electronics',
        price: 2499,
        condition: 'Like New',
        description: 'Full frame mirrorless camera in mint condition with original box and 2 batteries.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        specifications: { Brand: 'Sony', Sensor: '33MP Full-Frame' },
      };

      const res = await request(app)
        .post('/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newListing);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(newListing.title);
      expect(res.body.data.specifications).toEqual(newListing.specifications);
    });
  });

  describe('DELETE /listings/:id', () => {
    it('returns 401 when token is missing', async () => {
      const res = await request(app).delete('/listings/2');
      expect(res.status).toBe(401);
    });

    it('returns 404 when deleting non-existent listing', async () => {
      const res = await request(app)
        .delete('/listings/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 200 and removes listing when authorized', async () => {
      const res = await request(app)
        .delete('/listings/2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(2);

      // Verify it's actually deleted
      const checkRes = await request(app).get('/listings/2');
      expect(checkRes.status).toBe(404);
    });
  });
});