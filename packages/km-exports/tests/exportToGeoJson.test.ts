import { describe, it, expect } from 'vitest';
import { exportToGeoJson } from '../src/exportToGeoJson';
import type { GeoJsonFeature } from '../src/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makePointFeature(id?: string, x = 10, y = 20): GeoJsonFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates: [x, y] },
    properties: null,
  };
}

function makePolygonFeature(id?: string): GeoJsonFeature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    },
    properties: null,
  };
}

function makeNullGeomFeature(id?: string): GeoJsonFeature {
  return { type: 'Feature', id, geometry: null, properties: null };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('exportToGeoJson', () => {
  it('returns a Result<string> on success', () => {
    const result = exportToGeoJson({ features: [makePointFeature()] });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(typeof result.data).toBe('string');
  });

  it('output is valid JSON', () => {
    const result = exportToGeoJson({ features: [makePointFeature()] });
    if (!result.success) return;
    expect(() => JSON.parse(result.data)).not.toThrow();
  });

  it('output parses back to a GeoJsonFeatureCollection', () => {
    const result = exportToGeoJson({ features: [makePointFeature()] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { type: string; features: unknown[] };
    expect(parsed.type).toBe('FeatureCollection');
    expect(Array.isArray(parsed.features)).toBe(true);
  });

  it('single feature → features array with one entry', () => {
    const result = exportToGeoJson({ features: [makePointFeature('f1')] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { features: GeoJsonFeature[] };
    expect(parsed.features).toHaveLength(1);
  });

  it('multiple features → all included', () => {
    const result = exportToGeoJson({ features: [makePointFeature('a'), makePointFeature('b')] });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { features: GeoJsonFeature[] };
    expect(parsed.features).toHaveLength(2);
  });

  it('includeBbox: true (default) attaches bbox to collection', () => {
    const result = exportToGeoJson({ features: [makePolygonFeature()], includeBbox: true });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { bbox?: unknown };
    expect(parsed.bbox).toBeDefined();
  });

  it('includeBbox: false omits bbox', () => {
    const result = exportToGeoJson({ features: [makePolygonFeature()], includeBbox: false });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { bbox?: unknown };
    expect(parsed.bbox).toBeUndefined();
  });

  it('bbox computation is union of all feature bboxes', () => {
    const features = [makePointFeature('a', 10, 20), makePointFeature('b', 30, 40)];
    const result = exportToGeoJson({ features, includeBbox: true });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { bbox: [number, number, number, number] };
    expect(parsed.bbox[0]).toBe(10); // minX
    expect(parsed.bbox[1]).toBe(20); // minY
    expect(parsed.bbox[2]).toBe(30); // maxX
    expect(parsed.bbox[3]).toBe(40); // maxY
  });

  it('null-geometry features are handled without error', () => {
    const result = exportToGeoJson({ features: [makeNullGeomFeature('n')] });
    expect(result.success).toBe(true);
  });

  it('bbox omitted when all features have null geometry', () => {
    const result = exportToGeoJson({ features: [makeNullGeomFeature()], includeBbox: true });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { bbox?: unknown };
    expect(parsed.bbox).toBeUndefined();
  });

  it('pretty: true produces indented JSON', () => {
    const result = exportToGeoJson({ features: [makePointFeature()], pretty: true });
    if (!result.success) return;
    expect(result.data).toContain('\n');
    expect(result.data).toContain('  ');
  });

  it('pretty: false produces compact JSON', () => {
    const result = exportToGeoJson({ features: [makePointFeature()], pretty: false });
    if (!result.success) return;
    expect(result.data).not.toContain('\n');
  });

  it('filter by includeIds — only matching features in output', () => {
    const features = [makePointFeature('a'), makePointFeature('b'), makePointFeature('c')];
    const result = exportToGeoJson({ features, filter: { includeIds: ['a', 'c'] } });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { features: GeoJsonFeature[] };
    expect(parsed.features.map((f) => f.id)).toEqual(['a', 'c']);
  });

  it('returns empty-export error when all features are filtered out', () => {
    const result = exportToGeoJson({
      features: [makePointFeature('a')],
      filter: { includeIds: ['nonexistent'] },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('empty-export');
  });

  it('filter applied before bbox computation', () => {
    // Two features; we filter out one that would expand the bbox
    const features = [makePointFeature('a', 0, 0), makePointFeature('b', 1000, 1000)];
    const result = exportToGeoJson({ features, filter: { includeIds: ['a'] }, includeBbox: true });
    if (!result.success) return;
    const parsed = JSON.parse(result.data) as { bbox: [number, number, number, number] };
    // bbox should only reflect feature 'a'
    expect(parsed.bbox[2]).toBe(0); // maxX = 0 (only point at 0,0)
    expect(parsed.bbox[3]).toBe(0); // maxY = 0
  });
});
