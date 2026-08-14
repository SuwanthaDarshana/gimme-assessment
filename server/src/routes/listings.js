import { Router } from 'express';
import { getDb } from '../db.js';
import { ApiError } from '../utils/ApiError.js';
import { validateListing } from '../utils/validateListing.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const { q, category, minPrice, maxPrice, sortBy = 'date', order = 'desc', excludeId } = req.query;

    const conditions = [];
    const params = {};

    if (q) { conditions.push('title LIKE @q'); params.q = `%${q}%`; }
    if (category) { conditions.push('category = @category'); params.category = category; }
    if (minPrice !== undefined) { conditions.push('price >= @minPrice'); params.minPrice = Number(minPrice); }
    if (maxPrice !== undefined) { conditions.push('price <= @maxPrice'); params.maxPrice = Number(maxPrice); }
    if (excludeId !== undefined) { conditions.push('id != @excludeId'); params.excludeId = excludeId; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortCol = sortBy === 'price' ? 'price' : 'createdAt';
    const direction = order === 'asc' ? 'ASC' : 'DESC';

    const total = db.prepare(`SELECT COUNT(*) AS count FROM listings ${where}`).get(params).count;

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * limit;

    const rows = db.prepare(`
      SELECT * FROM listings ${where}
      ORDER BY ${sortCol} ${direction}
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset });

    const data = rows.map((r) => ({ ...r, specifications: JSON.parse(r.specifications) }));

    res.json({ data, meta: { total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!row) throw new ApiError(404, `Listing ${req.params.id} not found`);
    res.json({ data: { ...row, specifications: JSON.parse(row.specifications) } });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, (req, res, next) => {
  try {
    const errors = validateListing(req.body);
    if (errors.length) throw new ApiError(400, 'Validation failed', errors);

    const db = getDb();
    const { title, category, price, condition, description, image, specifications } = req.body;

    const result = db.prepare(`
      INSERT INTO listings (title, category, price, condition, description, image, specifications, createdAt)
      VALUES (@title, @category, @price, @condition, @description, @image, @specifications, @createdAt)
    `).run({
      title: title.trim(),
      category: category.trim(),
      price,
      condition,
      description: description.trim(),
      image: image || null,
      specifications: JSON.stringify(specifications || {}),
      createdAt: new Date().toISOString(),
    });

    const created = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: { ...created, specifications: JSON.parse(created.specifications) } });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!row) throw new ApiError(404, `Listing ${req.params.id} not found`);
    db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
    res.json({ data: { ...row, specifications: JSON.parse(row.specifications) } });
  } catch (err) { next(err); }
});

export default router;