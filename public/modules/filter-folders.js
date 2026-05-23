// Filter-scoped external folders.
//
// When the viewer is opened with ?f=<folderPath>, the active workspace is
// irrelevant (we are looking at a folder outside it). External folders added
// in that mode are persisted here, keyed by the value of the `f` param, so
// reloading the same ?f= restores them.
//
// Storage shape: { [filterKey: string]: string[] }
// localStorage key: 'filterFolders'

const STORAGE_KEY = 'filterFolders';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeAll(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function readListFor(map, filterKey) {
  const arr = map[filterKey];
  return Array.isArray(arr) ? arr.filter(p => typeof p === 'string') : [];
}

/**
 * @param {string} filterKey
 * @returns {string[]}
 */
export function getFilterFolders(filterKey) {
  if (!filterKey) return [];
  return [...readListFor(readAll(), filterKey)];
}

/**
 * @param {string} filterKey
 * @param {string} folderPath
 */
export function addFilterFolder(filterKey, folderPath) {
  if (!filterKey || !folderPath) return;
  // Adding the filter folder itself would just duplicate the existing entry.
  if (folderPath === filterKey) return;

  const map = readAll();
  const existing = readListFor(map, filterKey);
  if (existing.includes(folderPath)) return;

  writeAll({ ...map, [filterKey]: [...existing, folderPath] });
}

/**
 * @param {string} filterKey
 * @param {string} folderPath
 */
export function removeFilterFolder(filterKey, folderPath) {
  if (!filterKey) return;
  const map = readAll();
  const existing = readListFor(map, filterKey);
  if (!existing.includes(folderPath)) return;

  writeAll({ ...map, [filterKey]: existing.filter(p => p !== folderPath) });
}
