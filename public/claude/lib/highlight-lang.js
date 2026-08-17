/**
 * Language normalization for code-fence highlighting (ported from m-claude's
 * `lib/shiki.ts`). The Shiki-specific highlighter bootstrap is dropped; the
 * `normalizeLang` transform + alias map are reused verbatim, then mapped to
 * highlight.js language ids (highlight.js is loaded via CDN in `claude.html`).
 */

export const SUPPORTED_LANGS = [
  'ts', 'tsx', 'js', 'jsx', 'py', 'bash', 'json', 'md', 'yaml', 'html', 'css',
];

const LANG_ALIASES = {
  typescript: 'ts',
  javascript: 'js',
  python: 'py',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  markdown: 'md',
  yml: 'yaml',
};

/** highlight.js language id for each supported short lang. */
const HLJS_LANG = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  bash: 'bash',
  json: 'json',
  md: 'markdown',
  yaml: 'yaml',
  html: 'xml',
  css: 'css',
};

/**
 * Normalize a fenced-code language token to one of `SUPPORTED_LANGS`, or null.
 * @param {string|undefined|null} lang
 * @returns {string|null}
 */
export function normalizeLang(lang) {
  if (!lang) return null;
  const lower = String(lang).trim().toLowerCase();
  if (SUPPORTED_LANGS.includes(lower)) return lower;
  return LANG_ALIASES[lower] ?? null;
}

/**
 * Map a fenced-code language token to a highlight.js language id, or null when
 * unsupported (caller falls back to plain monospace).
 * @param {string|undefined|null} lang
 * @returns {string|null}
 */
export function hljsLang(lang) {
  const normalized = normalizeLang(lang);
  return normalized ? HLJS_LANG[normalized] : null;
}
