/**
 * Favourite projects — a pinned subset of the project switcher, persisted in
 * localStorage so the list survives reloads and the `file://` context.
 *
 * Storage shape: string[] of project slugs (the stable id used by the API).
 * localStorage key: 'claudeFavouriteProjects'
 */

const STORAGE_KEY = 'claudeFavouriteProjects';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slug) => typeof slug === 'string' && slug);
  } catch {
    return [];
  }
}

function write(slugs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    /* quota / disabled storage — favourites are a convenience, not critical */
  }
}

/** @returns {string[]} pinned slugs, in the order they were added */
export function getFavourites() {
  return read();
}

/**
 * @param {string} slug
 * @returns {boolean}
 */
export function isFavourite(slug) {
  return !!slug && read().includes(slug);
}

/**
 * Pin the slug if it is not pinned yet, unpin it otherwise.
 * @param {string} slug
 * @returns {string[]} the updated list
 */
export function toggleFavourite(slug) {
  if (!slug) return read();
  return isFavourite(slug) ? removeFavourite(slug) : addFavourite(slug);
}

/**
 * @param {string} slug
 * @returns {string[]} the updated list
 */
export function addFavourite(slug) {
  const current = read();
  if (!slug || current.includes(slug)) return current;
  const next = [...current, slug];
  write(next);
  return next;
}

/**
 * @param {string} slug
 * @returns {string[]} the updated list
 */
export function removeFavourite(slug) {
  const current = read();
  if (!slug || !current.includes(slug)) return current;
  const next = current.filter((s) => s !== slug);
  write(next);
  return next;
}
