import { config } from '../../config/index.js';
import { ForbiddenError } from '../../lib/errors.js';

/**
 * Gate mutation routes behind the ENABLE_WRITES flag.
 * When writes are disabled, every mutating request gets a 403.
 */
export function requireWrites(_req, _res, next) {
  if (!config.enableWrites) {
    return next(new ForbiddenError('Writes are disabled (ENABLE_WRITES=false)', 'WRITES_DISABLED'));
  }
  next();
}
