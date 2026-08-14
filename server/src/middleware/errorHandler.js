import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'Internal server error';

  if (statusCode >= 500) console.error(err);

  const body = { error: { message } };
  if (err instanceof ApiError && err.details) body.error.details = err.details;

  res.status(statusCode).json(body);
}