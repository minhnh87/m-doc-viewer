import { describe, test, expect } from 'vitest';
import { nextPromptIndex, nextRecentSession } from '../public/claude/lib/hotkey-nav.js';

describe('nextPromptIndex (j/k through the prompt outline)', () => {
  test('starts at the first prompt when none is active', () => {
    expect(nextPromptIndex(-1, 1, 5)).toBe(0);
    expect(nextPromptIndex(-1, -1, 5)).toBe(0);
  });

  test('moves forward and back by one', () => {
    expect(nextPromptIndex(2, 1, 5)).toBe(3);
    expect(nextPromptIndex(2, -1, 5)).toBe(1);
  });

  test('stops at both ends instead of wrapping', () => {
    expect(nextPromptIndex(4, 1, 5)).toBe(4);
    expect(nextPromptIndex(0, -1, 5)).toBe(0);
  });

  test('returns -1 when there are no prompts', () => {
    expect(nextPromptIndex(-1, 1, 0)).toBe(-1);
  });
});

describe('nextRecentSession (L cycles the 3 newest sessions)', () => {
  const sessions = ['s1', 's2', 's3', 's4', 's5'].map((id) => ({ id }));

  test('opens the newest session when the current one is not among the 3 newest', () => {
    expect(nextRecentSession(sessions, 's5').id).toBe('s1');
    expect(nextRecentSession(sessions, null).id).toBe('s1');
  });

  test('moves to the next of the 3 newest', () => {
    expect(nextRecentSession(sessions, 's1').id).toBe('s2');
    expect(nextRecentSession(sessions, 's2').id).toBe('s3');
  });

  test('wraps from the 3rd newest back to the newest', () => {
    expect(nextRecentSession(sessions, 's3').id).toBe('s1');
  });

  test('cycles within fewer sessions when the project has less than 3', () => {
    const two = sessions.slice(0, 2);
    expect(nextRecentSession(two, 's2').id).toBe('s1');
    expect(nextRecentSession([{ id: 'only' }], 'only').id).toBe('only');
  });

  test('returns null when there are no sessions', () => {
    expect(nextRecentSession([], 's1')).toBeNull();
  });
});
