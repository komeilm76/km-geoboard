import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://komeilm76.github.io',
  base: '/km-geoboard',
  integrations: [
    react(),
    starlight({
      title: 'km-geoboard',
      description: 'Artboard, GeoJSON, SVG, map, import/export, and plugin utilities for TypeScript.',
      social: {
        github: 'https://github.com/komeilm76/km-geoboard',
      },
      editLink: {
        baseUrl: 'https://github.com/komeilm76/km-geoboard/edit/main/apps/docs/',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Installation', slug: 'installation' },
          ],
        },
        {
          label: 'Live examples',
          items: [
            { label: 'Artboard quick start', slug: 'examples/artboard' },
            { label: 'SVG → GeoJSON', slug: 'examples/svg-to-geojson' },
            { label: 'Tile math', slug: 'examples/tile-math' },
            { label: 'Import / export round-trip', slug: 'examples/import-export' },
            { label: 'Plugin registry', slug: 'examples/plugin-registry' },
          ],
        },
        {
          label: 'API reference',
          autogenerate: { directory: 'api' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
