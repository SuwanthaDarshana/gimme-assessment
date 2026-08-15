import { Router } from 'express';
import { getDb } from '../db.js';
import { ApiError } from '../utils/ApiError.js';
import { validateListing } from '../utils/validateListing.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function safeParseJson(jsonString, fallback = {}) {
  if (!jsonString) return fallback;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

function formatListing(row) {
  if (!row) return null;
  return {
    ...row,
    specifications: safeParseJson(row.specifications, {}),
  };
}

/**
 * GET /listings
 * Query parameters:
 *  - q: search keyword in title or description
 *  - category: filter by exact category name
 *  - minPrice: minimum price filter
 *  - maxPrice: maximum price filter
 *  - condition: filter by condition
 *  - sortBy: 'price' | 'date' (default: 'date')
 *  - order: 'asc' | 'desc' (default: 'desc')
 *  - page: page number (default: 1)
 *  - limit: items per page (default: 12, max: 50)
 *  - excludeId: ID to exclude (used for similar items)
 */
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const { q, category, minPrice, maxPrice, condition, sortBy = 'date', order = 'desc', excludeId } = req.query;

    const conditions = [];
    const params = {};

    if (q && q.trim()) {
      conditions.push('(title LIKE @q OR description LIKE @q)');
      params.q = `%${q.trim()}%`;
    }

    if (category && category.trim()) {
      conditions.push('category = @category');
      params.category = category.trim();
    }

    if (condition && condition.trim()) {
      conditions.push('condition = @condition');
      params.condition = condition.trim();
    }

    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      conditions.push('price >= @minPrice');
      params.minPrice = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      conditions.push('price <= @maxPrice');
      params.maxPrice = Number(maxPrice);
    }

    if (excludeId !== undefined && excludeId !== '' && !isNaN(Number(excludeId))) {
      conditions.push('id != @excludeId');
      params.excludeId = Number(excludeId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumn = sortBy === 'price' ? 'price' : 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countStmt = db.prepare(`SELECT COUNT(*) AS count FROM listings ${whereClause}`);
    const total = countStmt.get(params).count;

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * limit;

    const queryStmt = db.prepare(`
      SELECT * FROM listings ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}, id DESC
      LIMIT @limit OFFSET @offset
    `);

    const rows = queryStmt.all({ ...params, limit, offset });
    const data = rows.map(formatListing);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /listings/:id
 * Retrieve a single listing by ID.
 */
router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid listing ID. Must be an integer.');
    }

    const db = getDb();
    const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);

    if (!row) {
      throw new ApiError(404, `Listing #${id} not found`);
    }

    res.json({ data: formatListing(row) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /listings
 * Create a new listing (requires JWT authentication).
 */
router.post('/', requireAuth, (req, res, next) => {
  try {
    const errors = validateListing(req.body);
    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }

    const db = getDb();
    const { title, category, price, condition, description, image, specifications } = req.body;

    const specsJson =
      specifications && typeof specifications === 'object'
        ? JSON.stringify(specifications)
        : '{}';

    const insertStmt = db.prepare(`
      INSERT INTO listings (title, category, price, condition, description, image, specifications, createdAt)
      VALUES (@title, @category, @price, @condition, @description, @image, @specifications, @createdAt)
    `);

    const result = insertStmt.run({
      title: title.trim(),
      category: category.trim(),
      price: Number(price),
      condition,
      description: description.trim(),
      image: image && typeof image === 'string' && image.trim() ? image.trim() : null,
      specifications: specsJson,
      createdAt: new Date().toISOString(),
    });

    const created = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      data: formatListing(created),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /listings/:id
 * Delete an existing listing by ID (requires JWT authentication).
 */
router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid listing ID. Must be an integer.');
    }

    const db = getDb();
    const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);

    if (!row) {
      throw new ApiError(404, `Listing #${id} not found`);
    }

    db.prepare('DELETE FROM listings WHERE id = ?').run(id);

    res.json({
      message: 'Listing deleted successfully',
      data: formatListing(row),
    });
  } catch (err) {
    next(err);
  }
});

export default router;