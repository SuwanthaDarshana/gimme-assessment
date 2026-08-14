import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { ApiError } from '../utils/ApiError.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password || password.length < 6) {
      throw new ApiError(400, 'Validation failed', ['username required', 'password must be 6+ chars']);
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) throw new ApiError(409, 'Username already taken');

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run(username, passwordHash);

    const token = jwt.sign({ sub: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ data: { token, username } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) throw new ApiError(400, 'username and password are required');

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, 'Invalid credentials');

    const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ data: { token, username } });
  } catch (err) { next(err); }
});

export default router;