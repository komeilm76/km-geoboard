import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@komeilm76/km-shared': resolve(__dirname, '../km-shared/src/index.ts'),
      '@komeilm76/km-artboard': resolve(__dirname, '../km-artboard/src/index.ts'),
      '@komeilm76/km-geojson': resolve(__dirname, '../km-geojson/src/index.ts'),
      '@komeilm76/km-svg': resolve(__dirname, '../km-svg/src/index.ts'),
      '@komeilm76/km-map': resolve(__dirname, '../km-map/src/index.ts'),
      '@komeilm76/km-imports': resolve(__dirname, '../km-imports/src/index.ts'),
      '@komeilm76/km-exports': resolve(__dirname, '../km-exports/src/index.ts'),
      '@komeilm76/km-plugins': resolve(__dirname, '../km-plugins/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
