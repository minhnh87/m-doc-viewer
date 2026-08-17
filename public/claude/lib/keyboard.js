/**
 * Keyboard matching primitives (ported from m-claude's `lib/keyboard.ts`).
 * The React `useKeyboardMap` hook is replaced by a framework-free
 * `attachKeyboardMap`; the pure `matches`/`isEditableTarget` logic is verbatim.
 *
 * A KeyBinding is: { key, mod?, shift?, alt?, allowInInput?, preventDefault?, handler }.
 * - `key`: lowercase `event.key`, or a token like "ArrowDown".
 * - `mod`: require ⌘ (macOS) / Ctrl (others).
 * - `shift`: enforced only when defined (layout-friendly).
 * - `allowInInput`: still fire inside inputs/contenteditable (default false).
 */

/**
 * @param {KeyboardEvent} event
 * @param {{key:string,mod?:boolean,shift?:boolean,alt?:boolean}} binding
 * @returns {boolean}
 */
export function matches(event, binding) {
  const wantMod = binding.mod ?? false;
  const gotMod = event.metaKey || event.ctrlKey;
  if (wantMod !== gotMod) return false;

  // Shift is only enforced when the binding opts in — keeps `?` (shifted on US,
  // unshifted elsewhere) working across layouts.
  if (binding.shift !== undefined && binding.shift !== event.shiftKey) return false;

  const wantAlt = binding.alt ?? false;
  if (wantAlt !== event.altKey) return false;

  const a = binding.key.length === 1 ? binding.key.toLowerCase() : binding.key;
  const b = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return a === b;
}

/**
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
export function isEditableTarget(target) {
  if (!target) return false;
  const el = /** @type {HTMLElement} */ (target);
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * Attach a document-level keyboard map. Returns a cleanup function.
 * Bindings can be swapped by passing a getter instead of a static array.
 *
 * @param {Array|() => Array} bindingsOrGetter
 * @returns {() => void} detach
 */
export function attachKeyboardMap(bindingsOrGetter) {
  const getBindings = typeof bindingsOrGetter === 'function'
    ? bindingsOrGetter
    : () => bindingsOrGetter;

  function onKeyDown(event) {
    const inEditable = isEditableTarget(event.target);
    for (const binding of getBindings()) {
      if (!matches(event, binding)) continue;
      if (inEditable && !binding.allowInInput) continue;
      if (binding.preventDefault !== false) event.preventDefault();
      binding.handler(event);
      return;
    }
  }

  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}
