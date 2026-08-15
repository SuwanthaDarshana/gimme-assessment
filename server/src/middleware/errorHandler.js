import { ApiError } from '../utils/ApiError.js';

/**
 * 404 Not Found fallback middleware.
 */
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handling middleware.
 * Ensures consistent response shape: { error: { message, details? } }
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.status || 500);
  const message = err instanceof ApiError || err.status ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error('[ServerError]', err);
  }

  const responseBody = {
    error: {
      message,
    },
  };

  if (err instanceof ApiError && err.details && err.details.length > 0) {
    responseBody.error.details = err.details;
  }

  res.status(statusCode).json(responseBody);
}