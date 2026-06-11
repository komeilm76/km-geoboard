import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@komeilm76/km-shared': resolve(__dirname, '../km-shared/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
