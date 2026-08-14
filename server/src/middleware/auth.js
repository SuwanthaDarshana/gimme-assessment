import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gimme-assessment-secret';

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new ApiError(401, 'Missing or malformed Authorization header'));

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

export { JWT_SECRET };