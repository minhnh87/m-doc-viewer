import { DEFAULT_EXCLUDE_DIRS, DEFAULT_EXTENSIONS } from './constants.js';
import { parseCsv, parseExtParam } from '../lib/params.js';

const MB = 1024 * 1024;

// Default shared secret + obfuscated route prefix. Both are overridable via env
// and are duplicated (verbatim) in the client's public/config.js. CHANGE THESE
// for real security — anyone who can read this repo knows the defaults.
const DEFAULT_API_KEY = '1acad1323344b15937de23f02afc4e964f77cf76c9c9f20b';
const DEFAULT_API_PREFIX = '/apif7f9470e8818';

// Env EXTENSIONS: unset -> defaults, "*" -> null ("all"), csv -> normalized list.
function resolveExtensions(envValue) {
  const parsed = parseExtParam(envValue); // undefined (unset) | null ("*") | list
  return parsed === undefined ? DEFAULT_EXTENSIONS : parsed;
}

// Normalize an API prefix to a leading-slash, no-trailing-slash path.
function normalizePrefix(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return DEFAULT_API_PREFIX;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export const config = {
  name: 'm-local-api',
  version: '1.0.0',
  port: Number(process.env.M_LOCAL_API_PORT || process.env.PORT) || 3333,
  host: process.env.M_LOCAL_API_HOST || '127.0.0.1',
  excludeDirs: parseCsv(process.env.EXCLUDE_DIRS) || DEFAULT_EXCLUDE_DIRS,
  extensions: resolveExtensions(process.env.EXTENSIONS), // null => all
  includeHidden: process.env.INCLUDE_HIDDEN === 'true',
  maxFileBytes: Number(process.env.MAX_FILE_BYTES) || 25 * MB,
  enableWrites: process.env.ENABLE_WRITES !== 'false',
  // Auth: clients must send `X-API-Key: <apiKey>`. Empty string disables auth.
  apiKey: process.env.API_KEY !== undefined ? process.env.API_KEY : DEFAULT_API_KEY,
  // Obfuscated route prefix (security-by-obscurity, layered with the key).
  apiPrefix: normalizePrefix(process.env.API_PREFIX),
};
