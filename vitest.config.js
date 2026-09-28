import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only the ported unit tests for the Claude viewer live here; the rest of
    // the repo is unrelated content, so keep the scan tight and fast.
    include: ['test/**/*.test.js'],
    environment: 'node',
  },
});
