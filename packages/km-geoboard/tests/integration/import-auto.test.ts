/**
 * Integration: importAuto correctly routes all four formats and rejects
 * malformed input. Packages exercised: km-imports + all importers.
 */
import { describe, it, expect } from 'vitest';
import { artboard, imports } from '../../src/index';

const GEOJSON_FC = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [1, 2] },
      properties: null,
    },
  ],
});

const OPENLAYERS_FC = {
  type: 'FeatureCollection',
  crs: { type: 'name', properties: { name: 'EPSG:3857' } },
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [111319.49, 222684.21] },
      properties: null,
    },
  ],
};

const SVG_STRING = '<svg viewBox="0 0 10 10"><rect x="1" y="1" width="2" height="2" /></svg>';

function makeSnapshot(): string {
  const r = artboard.createArtboard({
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 100 },
    name: 'Auto',
  });
  if (!r.success) throw new Error('artboard creation failed');
  return JSON.stringify([r.artboard]);
}

describe('importAuto format routing', () => {
  it('routes GeoJSON strings to the GeoJSON importer', () => {
    const auto = imports.importAuto(GEOJSON_FC);
    expect(auto.format).toBe('geojson');
    expect(auto.result.success).toBe(true);
  });

  it('routes OpenLayers payloads (crs present) to the OpenLayers importer', () => {
    const auto = imports.importAuto(OPENLAYERS_FC);
    expect(auto.format).toBe('openlayers');
    expect(auto.result.success).toBe(true);
  });

  it('routes SVG strings to the SVG importer', () => {
    const auto = imports.importAuto(SVG_STRING);
    expect(auto.format).toBe('svg');
    expect(auto.result.success).toBe(true);
  });

  it('routes artboard snapshots to the snapshot importer', () => {
    const auto = imports.importAuto(makeSnapshot());
    expect(auto.format).toBe('artboard-snapshot');
    expect(auto.result.success).toBe(true);
  });

  it('reports unknown for malformed input', () => {
    for (const bad of ['garbage', '{not json', 42, { type: 'Nonsense' }, [1, 2, 3]]) {
      const auto = imports.importAuto(bad);
      expect(auto.format).toBe('unknown');
      expect(auto.result.success).toBe(false);
    }
  });

  it('detectImportFormat agrees with importAuto routing', () => {
    expect(imports.detectImportFormat(GEOJSON_FC)).toBe('geojson');
    expect(imports.detectImportFormat(OPENLAYERS_FC)).toBe('openlayers');
    expect(imports.detectImportFormat(SVG_STRING)).toBe('svg');
    expect(imports.detectImportFormat('garbage')).toBe('unknown');
  });
});
