// Helpers to parse loosely-typed query/body params into typed scan options.

export function parseCsv(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const list = String(value).split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

/**
 * Parse an `ext` param.
 * - undefined/empty -> undefined (caller should fall back to config default)
 * - "*"             -> null (means "all files")
 * - csv             -> normalized list of dotted, lowercased extensions
 */
export function parseExtParam(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (String(value).trim() === '*') return null;
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((e) => (e.startsWith('.') ? e : `.${e}`).toLowerCase());
}

export function parseBool(value) {
  return value === true || value === 'true' || value === '1';
}

export function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseIntOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
