/**
 * Integration: plugin registry loading a plugin that wraps an importer.
 * Packages exercised: km-plugins, km-imports.
 */
import { describe, it, expect } from 'vitest';
import { plugins, imports } from '../../src/index';
import type { Plugin } from '@komeilm76/km-plugins';
import type { ImportResult } from '@komeilm76/km-imports';
import type { GeoJsonFeatureCollection } from '@komeilm76/km-geojson';

type ImporterApi = {
  importFeatureCollection: (raw: string | unknown) => ImportResult<GeoJsonFeatureCollection>;
  [key: string]: unknown;
};

const importerPlugin: Plugin<ImporterApi> = {
  id: 'com.km-geoboard.geojson-importer',
  name: 'GeoJSON importer plugin',
  version: '1.0.0',
  setup: () => ({
    importFeatureCollection: (raw) => imports.importGeoJson(raw),
  }),
};

const FC_STRING = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'p1',
      geometry: { type: 'Point', coordinates: [-0.1276, 51.5074] },
      properties: { name: 'London' },
    },
  ],
});

describe('plugin registry wrapping an importer', () => {
  it('registers the plugin and exposes the importer through getApi', () => {
    const registry = plugins.createPluginRegistry();

    const registered = registry.register(importerPlugin);
    expect(registered.success).toBe(true);

    const api = registry.getApi<ImporterApi>('com.km-geoboard.geojson-importer');
    expect(api).not.toBeNull();

    const result = api!.importFeatureCollection(FC_STRING);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.features).toHaveLength(1);
    expect(result.data.features[0]!.id).toBe('p1');
  });

  it('rejects double registration but keeps the importer functional', () => {
    const registry = plugins.createPluginRegistry();
    expect(registry.register(importerPlugin).success).toBe(true);

    const second = registry.register(importerPlugin);
    expect(second.success).toBe(false);
    if (!second.success) {
      expect(second.error.code).toBe('already-registered');
    }

    const api = registry.getApi<ImporterApi>('com.km-geoboard.geojson-importer');
    expect(api!.importFeatureCollection(FC_STRING).success).toBe(true);
  });

  it('unregisters cleanly', () => {
    const registry = plugins.createPluginRegistry();
    registry.register(importerPlugin);

    const removed = registry.unregister('com.km-geoboard.geojson-importer');
    expect(removed.success).toBe(true);
    expect(registry.getApi('com.km-geoboard.geojson-importer')).toBeNull();
  });
});
