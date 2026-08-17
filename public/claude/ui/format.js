/** Small display formatters shared by the session list and metadata panel. */

/** Local wall-clock time for a message timestamp, e.g. "10:04". Empty on invalid. */
export function formatClock(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Compact token/number formatting: 940 → "940", 12345 → "12.3k", 2_000_000 → "2M". */
export function formatTokens(n) {
  const num = Number(n) || 0;
  if (num < 1000) return String(num);
  if (num < 1_000_000) {
    const k = num / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}k`;
  }
  return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}
