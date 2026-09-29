// Pure index math for the conversation viewer's navigation hotkeys
// (mirrors the markdown viewer: J/K walk the outline, L cycles recent files).

const RECENT_SESSION_COUNT = 3;

/**
 * j/k: next prompt index in the outline. Starts at the first prompt when none
 * is active; clamps at both ends (no wrap). -1 when there are no prompts.
 */
export function nextPromptIndex(currentIndex, delta, count) {
  if (count <= 0) return -1;
  if (currentIndex === -1) return 0;
  return Math.min(count - 1, Math.max(0, currentIndex + delta));
}

/**
 * L: the session after `currentId` among the newest sessions (list is sorted
 * newest first), wrapping around. Opens the newest when `currentId` isn't one
 * of them. null when there are no sessions.
 */
export function nextRecentSession(sessions, currentId) {
  const recent = sessions.slice(0, RECENT_SESSION_COUNT);
  if (!recent.length) return null;
  const index = recent.findIndex((s) => s.id === currentId);
  return recent[(index + 1) % recent.length];
}
