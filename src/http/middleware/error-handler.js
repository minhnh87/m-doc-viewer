import { HttpError } from '../../lib/errors.js';

/**
 * Express error middleware — maps thrown errors to JSON responses.
 */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
