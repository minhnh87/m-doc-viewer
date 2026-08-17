// API adapter / dispatcher.
//
// Every frontend module still calls the legacy `apiFetch('/api/...', options)`.
// This module keeps that signature but translates each call to the generic,
// path-based m-local-api (see /config.js) and maps the response back to the
// exact shape the old markdown-reader server returned — so no other module
// needs to change.

import {
  cfg, apiBase, apiPrefix, authHeaders, buildQuery, rawFetch,
} from './http-core.js';

// --- project-relative <-> absolute helpers -------------------------------
// Recreate the "illusion" of project-relative paths (isExternal=false) vs
// external absolute paths (isExternal=true) that state.js / navigation.js rely on.
function projectRoot() {
  return String(cfg().PROJECT_ROOT || '').replace(/\/+$/, '');
}
function projectExclude() {
  return cfg().PROJECT_EXCLUDE || [];
}
function toAbs(rel) {
  const root = projectRoot();
  return rel ? `${root}/${rel}` : root;
}
function under(abs) {
  const root = projectRoot();
  return abs === root || abs.startsWith(`${root}/`);
}
function toRel(abs) {
  const root = projectRoot();
  return under(abs) ? abs.slice(root.length + 1) : abs;
}
function isExt(abs) {
  return !under(abs);
}
function stripTrailingSlash(p) {
  return String(p).replace(/\/+$/, '');
}
function parseJsonArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- per-endpoint mappings ------------------------------------------------

async function getFiles() {
  const data = await rawFetch(`/tree${buildQuery({
    root: projectRoot(),
    exclude: projectExclude().join(','),
    includeHidden: 'true',
  })}`);

  const grouped = {};
  for (const file of data.files || []) {
    const key = (file.folder === '.' || file.folder === '' || file.folder == null)
      ? 'Root' : file.folder;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      name: file.name, path: file.relPath, folder: file.folder, type: file.type,
    });
  }
  for (const folder of data.folders || []) {
    if (!grouped[folder]) grouped[folder] = [];
  }
  return grouped;
}

async function scanTrees(body) {
  const paths = (body && body.paths) || [];
  const data = await rawFetch('/trees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roots: paths, includeHidden: true }),
  });

  const result = {};
  for (const entry of data.roots || []) {
    const grouped = {};
    for (const file of entry.files || []) {
      const key = file.folder || '.';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        name: file.name, path: file.path, folder: file.folder, type: file.type, isExternal: true,
      });
    }
    // Key by the raw root we sent, so callers match on their stored path.
    result[entry.root] = grouped;
  }
  return result;
}

async function getContent(sp) {
  const p = sp.get('path');
  const external = sp.get('external') === 'true';
  const abs = external ? p : toAbs(p);
  const data = await rawFetch(`/content${buildQuery({ path: abs })}`);

  // Decide markdown by *extension* (matches content-loader.js routing), NOT by
  // the API's coarse `type` (which now falls back to "text").
  const isMarkdown = !/\.(drawio|mermaid|mmd)$/i.test(p || '');
  const result = {
    content: data.content,
    type: isMarkdown ? 'markdown' : data.type,
    path: p,
    isExternal: external,
    mtime: data.mtime,
  };
  if (isMarkdown) {
    result.html = (window.marked && window.marked.parse)
      ? window.marked.parse(data.content)
      : data.content;
  }
  return result;
}

async function doSearch(sp) {
  const query = sp.get('query');
  const scope = sp.get('scope') || 'folder';

  let roots;
  let recursive;
  const extraParams = {};

  if (scope === 'all') {
    const externalFolders = parseJsonArray(sp.get('externalFolders'));
    roots = [projectRoot(), ...externalFolders];
    recursive = true;
    // Preserve the old scope=all exclusions + hidden-dir visibility.
    extraParams.exclude = projectExclude().join(',');
    extraParams.includeHidden = 'true';
  } else {
    const external = sp.get('external') === 'true';
    const folder = sp.get('folder') || '';
    roots = [external ? folder : toAbs(folder)];
    recursive = false; // direct children only (depth 0)
  }

  const data = await rawFetch(`/search${buildQuery({
    query,
    roots: JSON.stringify(roots),
    recursive: recursive ? 'true' : 'false',
    ...extraParams,
  })}`);

  const results = (data.results || []).map((r) => {
    const abs = r.file.path;
    const external = isExt(abs);
    return {
      file: { ...r.file, path: external ? abs : toRel(abs), isExternal: external },
      matches: r.matches,
    };
  });
  return { results, totalMatches: data.totalMatches, totalFiles: data.totalFiles };
}

async function createFolder(body) {
  await rawFetch('/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: toAbs(body.name) }),
  });
  return { success: true };
}

async function deleteFolder(sp) {
  const p = sp.get('path');
  const external = sp.get('external') === 'true';
  const abs = external ? p : toAbs(p);
  const data = await rawFetch(`/folder${buildQuery({ path: abs })}`, { method: 'DELETE' });
  return data || { success: true };
}

async function deleteFile(sp) {
  const p = sp.get('path');
  const external = sp.get('external') === 'true';
  const abs = external ? p : toAbs(p);
  const data = await rawFetch(`/file${buildQuery({ path: abs })}`, { method: 'DELETE' });
  return data || { success: true };
}

async function writeFileContent(body) {
  const abs = body.external ? body.path : toAbs(body.path);
  return rawFetch('/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: abs, content: body.content, baseMtime: body.baseMtime }),
  });
}

async function moveFile(body) {
  await rawFetch('/file/move', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: toAbs(body.from), to: toAbs(body.to || '') }),
  });
  return { success: true };
}

async function renameItem(body) {
  await rawFetch('/rename', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: toAbs(body.oldPath), newName: body.newName }),
  });
  return { success: true };
}

async function validateFolder(body) {
  return rawFetch('/validate-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: body.path }),
  });
}

async function latestPlan() {
  const data = await rawFetch(`/newest${buildQuery({ dir: cfg().PLANS_DIR, ext: '.md' })}`);
  return { path: data.path, name: data.name };
}

async function latestSession(sp) {
  const folder = sp.get('folder');
  const dir = `${stripTrailingSlash(folder)}/${cfg().SESSIONS_DIR_NAME || '.clsessions'}`;
  const data = await rawFetch(`/newest${buildQuery({ dir, ext: '.md' })}`);
  return { path: data.path, name: data.name };
}

async function lastTalk(sp) {
  const folder = sp.get('folder');
  const fileName = cfg().LAST_TALK_FILE || 'last_talk.md';
  const filePath = `${stripTrailingSlash(folder)}/${cfg().SESSIONS_DIR_NAME || '.clsessions'}/${fileName}`;

  // Probe via /content — preserve old semantics: 404 throws.
  let response;
  try {
    response = await fetch(`${apiBase()}${apiPrefix()}/content${buildQuery({ path: filePath })}`, { headers: authHeaders() });
  } catch (err) {
    throw new Error(`Cannot reach API at ${apiBase()} — ${err.message}`);
  }
  if (response.status === 404) throw new Error('last_talk.md not found');
  if (!response.ok) {
    let message = 'Request failed';
    try { const d = await response.json(); message = d.error || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  return { path: filePath, name: fileName };
}

// --- dispatcher -----------------------------------------------------------

async function dispatch(url, options) {
  const method = (options.method || 'GET').toUpperCase();
  const u = new URL(url, 'http://local'); // dummy base for relative /api paths
  const sp = u.searchParams;
  const body = options.body ? JSON.parse(options.body) : null;

  switch (u.pathname) {
    case '/api/files': return getFiles();
    case '/api/external-files': return scanTrees(body);
    case '/api/content': return getContent(sp);
    case '/api/search': return doSearch(sp);
    case '/api/folder': return method === 'DELETE' ? deleteFolder(sp) : createFolder(body);
    case '/api/file': return deleteFile(sp);
    case '/api/file/write': return writeFileContent(body);
    case '/api/file/move': return moveFile(body);
    case '/api/rename': return renameItem(body);
    case '/api/validate-folder': return validateFolder(body);
    case '/api/latest-plan': return latestPlan();
    case '/api/latest-session': return latestSession(sp);
    case '/api/last-talk': return lastTalk(sp);
    default: throw new Error(`Unsupported API route: ${u.pathname}`);
  }
}

export async function apiFetch(url, options = {}) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    return dispatch(url, options);
  }
  // Fallback: plain fetch for any non-/api URL (not expected in this app).
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
