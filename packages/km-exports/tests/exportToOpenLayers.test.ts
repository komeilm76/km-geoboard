import { describe, it, expect } from 'vitest';
import { exportToOpenLayers } from '../src/exportToOpenLayers';
import type { GeoJsonFeature } from '../src/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFeature(id?: string): GeoJsonFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates: [10, 20] },
    properties: null,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('exportToOpenLayers', () => {
  it('returns a Result<string> on success', () => {
    const result = exportToOpenLayers({ features: [makeFeature()] });
    expect(result.success).toBe(true);
  });

  it('output is valid JSON', () => {
    const result = exportToOpenLayers({ features: [makeFeature()] });
    if (!result.success) return;
    expect(() => JSON.parse(result.data)).not.toThrow();
  });

  it('output is a FeatureCollection', () => {
    const result = exportToOpenLayers({ features: [makeFeature()] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { type: string };
    expect(parsed.type).toBe('FeatureCollection');
  });

  it('default projection (EPSG:4326) → no crs field', () => {
    const result = exportToOpenLayers({ features: [makeFeature()] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { crs?: unknown };
    expect(parsed.crs).toBeUndefined();
  });

  it('explicit EPSG:4326 → no crs field', () => {
    const result = exportToOpenLayers({ features: [makeFeature()], projection: 'EPSG:4326' });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { crs?: unknown };
    expect(parsed.crs).toBeUndefined();
  });

  it('custom projection → crs field present', () => {
    const result = exportToOpenLayers({ features: [makeFeature()], projection: 'EPSG:3857' });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { crs?: { type: string; properties: { name: string } } };
    expect(parsed.crs).toBeDefined();
    expect(parsed.crs?.type).toBe('name');
    expect(parsed.crs?.properties.name).toBe('EPSG:3857');
  });

  it('custom projection crs format matches OpenLayers convention', () => {
    const result = exportToOpenLayers({ features: [makeFeature()], projection: 'EPSG:27700' });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { crs: { type: string; properties: { name: string } } };
    expect(parsed.crs).toEqual({ type: 'name', properties: { name: 'EPSG:27700' } });
  });

  it('propagates empty-export error from exportToGeoJson', () => {
    const result = exportToOpenLayers({
      features: [makeFeature('a')],
      filter: { includeIds: ['nonexistent'] },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('empty-export');
  });

  it('pretty: true produces indented JSON', () => {
    const result = exportToOpenLayers({ features: [makeFeature()], pretty: true });
    if (!result.success) return;
    expect(result.data).toContain('\n');
  });

  it('preserves features in output', () => {
    const result = exportToOpenLayers({ features: [makeFeature('f1'), makeFeature('f2')] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { features: GeoJsonFeature[] };
    expect(parsed.features).toHaveLength(2);
  });
});
