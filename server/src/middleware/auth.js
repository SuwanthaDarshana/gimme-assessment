import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'gimme-assessment-secret-key-2026';

/**
 * Authentication middleware that verifies JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required: missing or malformed Bearer token'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired. Please log in again.'));
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
}