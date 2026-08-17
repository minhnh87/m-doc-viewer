/**
 * Short relative-time + duration helpers (ported from m-claude's
 * `lib/relative-time.ts`, reimplemented WITHOUT `date-fns` so nothing extra is
 * bundled). Semantics match the original: "just now", "3m ago", "2h ago",
 * "yesterday", "5d ago", "2w ago", then a truncated ISO date past 30 days.
 */

const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function sameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date, now) {
  return sameCalendarDay(date, now);
}

function isYesterday(date, now) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return sameCalendarDay(date, yesterday);
}

/**
 * @param {string|Date} input
 * @param {Date} [now]
 * @returns {string}
 */
export function relativeTime(input, now = new Date()) {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / MS_PER_SEC);
  if (diffSec < 45) return 'just now';

  const diffMin = Math.floor(diffMs / MS_PER_MIN);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMs / MS_PER_HOUR);
  if (isToday(date, now)) return `${diffHr}h ago`;
  if (isYesterday(date, now)) return 'yesterday';

  const diffDay = Math.floor(diffMs / MS_PER_DAY);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;

  return date.toISOString().slice(0, 10);
}

/**
 * Human-readable duration: "1h 23m", "4m 12s", "47s".
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 0 || !Number.isFinite(ms)) return '—';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
