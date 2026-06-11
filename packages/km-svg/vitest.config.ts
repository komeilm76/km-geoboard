import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'km-geojson': resolve(__dirname, '../km-geojson/src/index.ts'),
      'km-shared': resolve(__dirname, '../km-shared/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
