/**
 * Known Claude tool name → inline SVG glyph (ported from m-claude's
 * `lib/tool-icons.ts`; lucide-react components are swapped for inline SVG so the
 * static bundle needs no icon library). Every surface renders the same icon for
 * the same tool — update this map once and it lights up everywhere.
 */

// Lucide 24×24 stroke paths (inner markup only).
const TERMINAL = '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>';
const PENCIL = '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>';
const FILE_PLUS = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/>';
const FILE_TEXT = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>';
const NOTEBOOK = '<path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/>';
const GLOBE = '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>';
const SEARCH = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>';
const FILE_SEARCH = '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/>';
const WRENCH = '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>';

/** @type {Record<string, string>} */
export const TOOL_ICONS = {
  Bash: TERMINAL,
  Edit: PENCIL,
  MultiEdit: PENCIL,
  Write: FILE_PLUS,
  Read: FILE_TEXT,
  NotebookEdit: NOTEBOOK,
  WebFetch: GLOBE,
  WebSearch: SEARCH,
  Glob: FILE_SEARCH,
  Grep: SEARCH,
};

/** Return the inner SVG markup for a tool name (wrench fallback). */
export function iconForTool(name) {
  return TOOL_ICONS[name] ?? WRENCH;
}

/**
 * Full inline `<svg>` string for a tool, sized 1em and inheriting `currentColor`.
 * @param {string} name
 * @param {string} [className]
 */
export function toolIconSvg(name, className = 'tool-icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconForTool(name)}</svg>`;
}
