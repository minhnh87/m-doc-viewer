// Shared HTTP core for talking to the generic, path-based m-local-api.
//
// These primitives (base URL, obfuscated prefix, API-key auth headers, query
// builder, and a low-level fetch with ok/throw semantics) are consumed by BOTH
// the markdown viewer's `api.js` adapter AND the Claude conversation viewer's
// `claude/claude-api.js`. Keeping them here avoids duplicating the request
// plumbing (and the auth/prefix wiring) across the two apps.

export function cfg() {
  return window.APP_CONFIG || {};
}

export function apiBase() {
  return String(cfg().API_BASE_URL || '').replace(/\/+$/, '');
}

export function apiPrefix() {
  const p = String(cfg().API_PREFIX || '/api').trim().replace(/\/+$/, '');
  return p.startsWith('/') ? p : `/${p}`;
}

export function apiKey() {
  return cfg().API_KEY || '';
}

/** Merge `X-API-Key` into a headers object (when a key is configured). */
export function authHeaders(extra) {
  const headers = { ...(extra || {}) };
  const key = apiKey();
  if (key) headers['X-API-Key'] = key;
  return headers;
}

/** Build a `?a=1&b=2` query string, skipping null/undefined values. */
export function buildQuery(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Low-level fetch against `apiBase + apiPrefix + subPath`. Attaches auth
 * headers, parses a JSON body when present, and throws on a non-2xx response
 * (surfacing the server's `{ error }` envelope when available). Network-level
 * failures throw a "Cannot reach API" message so callers can offer a retry.
 */
export async function rawFetch(subPath, options = {}) {
  let response;
  try {
    response = await fetch(apiBase() + apiPrefix() + subPath, {
      ...options,
      headers: authHeaders(options.headers),
    });
  } catch (err) {
    throw new Error(`Cannot reach API at ${apiBase() || '(unset API_BASE_URL)'} — ${err.message}`);
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }
  if (!response.ok) {
    const error = new Error((data && data.error) || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
