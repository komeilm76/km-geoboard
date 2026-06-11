import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@komeilm76/km-shared': resolve(__dirname, '../km-shared/src/index.ts'),
      '@komeilm76/km-artboard': resolve(__dirname, '../km-artboard/src/index.ts'),
      '@komeilm76/km-geojson': resolve(__dirname, '../km-geojson/src/index.ts'),
      '@komeilm76/km-svg': resolve(__dirname, '../km-svg/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
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
