/**
 * In-memory keyed cache for parsed session data (ported from m-claude's
 * `lib/cache.ts`). Page-lifetime scope; cleared on reload. Keyed by
 * `${slug}:${id}:${mtimeMs}` so a file rewrite invalidates only that entry.
 */

export function createKeyedCache() {
  const store = new Map();

  return {
    get(key) {
      return store.get(key);
    },
    set(key, value) {
      store.set(key, value);
    },
    async getOrSet(key, loader) {
      const hit = store.get(key);
      if (hit !== undefined) return hit;
      const value = await loader();
      store.set(key, value);
      return value;
    },
    getOrSetSync(key, loader) {
      const hit = store.get(key);
      if (hit !== undefined) return hit;
      const value = loader();
      store.set(key, value);
      return value;
    },
    invalidatePrefix(prefix) {
      let removed = 0;
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key);
          removed += 1;
        }
      }
      return removed;
    },
    get size() {
      return store.size;
    },
    clear() {
      store.clear();
    },
  };
}
