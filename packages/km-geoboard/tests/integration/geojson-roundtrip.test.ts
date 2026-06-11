/**
 * Integration: GeoJSON → importGeoJson → exportToGeoJson → importGeoJson,
 * deep-equal. Packages exercised: km-imports, km-exports, km-geojson.
 */
import { describe, it, expect } from 'vitest';
import { imports, exports as exporters } from '../../src/index';

const FC = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'pt-1',
      geometry: { type: 'Point', coordinates: [-0.1276, 51.5074] },
      properties: { name: 'London' },
    },
    {
      type: 'Feature',
      id: 'poly-1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      },
      properties: { kind: 'square' },
    },
    {
      type: 'Feature',
      id: 'ls-1',
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.3522, 48.8566],
          [-0.1276, 51.5074],
        ],
      },
      properties: null,
    },
  ],
};

describe('GeoJSON import → export → import round-trip', () => {
  it('deep-equals after a full cycle (string input)', () => {
    const first = imports.importGeoJson(JSON.stringify(FC));
    expect(first.success).toBe(true);
    if (!first.success) return;

    const exported = exporters.exportToGeoJson({ features: first.data.features });
    expect(exported.success).toBe(true);
    if (!exported.success) return;

    const second = imports.importGeoJson(exported.data);
    expect(second.success).toBe(true);
    if (!second.success) return;

    expect(second.data.features).toEqual(first.data.features);
  });

  it('deep-equals after a full cycle (object input, pretty output)', () => {
    const first = imports.importGeoJson(FC);
    expect(first.success).toBe(true);
    if (!first.success) return;

    const exported = exporters.exportToGeoJson({
      features: first.data.features,
      pretty: true,
      includeBbox: false,
    });
    expect(exported.success).toBe(true);
    if (!exported.success) return;

    const second = imports.importGeoJson(exported.data);
    expect(second.success).toBe(true);
    if (!second.success) return;

    expect(second.data.features).toEqual(first.data.features);
  });

  it('export filter and reimport compose: only the filtered feature survives', () => {
    const first = imports.importGeoJson(FC);
    if (!first.success) throw new Error('import failed');

    const exported = exporters.exportToGeoJson({
      features: first.data.features,
      filter: { includeIds: ['poly-1'] },
    });
    expect(exported.success).toBe(true);
    if (!exported.success) return;

    const second = imports.importGeoJson(exported.data);
    expect(second.success).toBe(true);
    if (!second.success) return;

    expect(second.data.features).toHaveLength(1);
    expect(second.data.features[0]!.id).toBe('poly-1');
  });
});
