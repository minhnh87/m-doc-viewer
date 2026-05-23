const UNSAFE_NAME_CHARS = /[<>:"/\\|?*]/g;

/**
 * Strip filesystem-unsafe characters from a name and trim whitespace.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFsName(name) {
  if (typeof name !== 'string') return '';
  return name.replace(UNSAFE_NAME_CHARS, '').trim();
}
