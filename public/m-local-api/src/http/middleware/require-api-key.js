import { config } from '../../config/index.js';
import { UnauthorizedError } from '../../lib/errors.js';

const HEADER = 'x-api-key';

/**
 * Require a matching `X-API-Key` header on every request except CORS preflight
 * and `/health` (liveness). Disabled when `config.apiKey` is empty.
 */
export function requireApiKey(req, _res, next) {
  if (req.method === 'OPTIONS') return next(); // cors already answered preflight
  if (!config.apiKey) return next(); // auth disabled
  if (req.path.endsWith('/health')) return next(); // liveness stays open

  const provided = req.get(HEADER);
  if (provided && provided === config.apiKey) return next();
  return next(new UnauthorizedError());
}
