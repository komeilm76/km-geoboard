import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'km-shared': resolve(__dirname, '../km-shared/src/index.ts'),
      'km-geojson': resolve(__dirname, '../km-geojson/src/index.ts'),
      'km-svg': resolve(__dirname, '../km-svg/src/index.ts'),
      'km-artboard': resolve(__dirname, '../km-artboard/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        branches:   80,
        functions:  85,
        lines:      85,
        statements: 85,
      },
    },
  },
});
