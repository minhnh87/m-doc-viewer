/**
 * Scroll the message node with `id={uuid}` into view and move focus there.
 * Ported 1:1 from m-claude's `lib/scroll-to-message.ts` (already vanilla DOM).
 *
 * - Honors `prefers-reduced-motion: reduce` by switching to `behavior: "instant"`.
 * - Stamps `tabindex="-1"` only if missing, then focuses with `preventScroll`.
 *
 * @param {string} uuid
 * @returns {boolean} true when the target was found and focused.
 */
export function scrollToMessage(uuid) {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(uuid);
  if (!el) return false;

  const reduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  el.scrollIntoView({
    behavior: reduced ? 'instant' : 'smooth',
    block: 'start',
  });

  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  return true;
}
