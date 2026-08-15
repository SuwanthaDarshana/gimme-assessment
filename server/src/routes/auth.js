import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { ApiError } from '../utils/ApiError.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/register
 * Register a new user account.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    const errors = [];
    if (!username || typeof username !== 'string' || !username.trim()) {
      errors.push('Username is required');
    } else if (username.trim().length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Registration validation failed', errors);
    }

    const cleanUsername = username.trim();
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      throw new ApiError(409, `Username '${cleanUsername}' is already taken`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run(cleanUsername, passwordHash);

    const token = jwt.sign({ sub: result.lastInsertRowid, username: cleanUsername }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      data: {
        token,
        username: cleanUsername,
        userId: result.lastInsertRowid,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Authenticate with username and password.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      throw new ApiError(400, 'Username and password are required');
    }

    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);

    if (!user) {
      throw new ApiError(401, 'Invalid username or password');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new ApiError(401, 'Invalid username or password');
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      data: {
        token,
        username: user.username,
        userId: user.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 * Validate current user session and return user profile.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    data: {
      userId: req.user.sub,
      username: req.user.username,
    },
  });
});

export default router;