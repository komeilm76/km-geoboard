import { describe, it, expect } from 'vitest';
import { importGeoJson } from '../src/importGeoJson';

// ─── Error paths ──────────────────────────────────────────────────────────────

describe('importGeoJson — errors', () => {
  it('returns empty-input for null', () => {
    const r = importGeoJson(null);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
    expect(r.warnings).toEqual([]);
  });

  it('returns empty-input for undefined', () => {
    const r = importGeoJson(undefined);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
  });

  it('returns empty-input for empty string', () => {
    const r = importGeoJson('');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
  });

  it('returns invalid-json for non-JSON string', () => {
    const r = importGeoJson('not json at all');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('invalid-json');
    expect(r.warnings).toEqual([]);
  });

  it('returns schema-mismatch for valid JSON that is not GeoJSON', () => {
    const r = importGeoJson('{"foo":"bar"}');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('schema-mismatch');
  });

  it('returns schema-mismatch for an array (not GeoJSON)', () => {
    const r = importGeoJson([1, 2, 3]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('schema-mismatch');
  });
});

// ─── FeatureCollection input ──────────────────────────────────────────────────

describe('importGeoJson — FeatureCollection input', () => {
  it('returns the FeatureCollection as-is', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { name: 'test' } },
      ],
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('FeatureCollection');
      expect(r.data.features).toHaveLength(1);
      expect(r.warnings).toEqual([]);
    }
  });

  it('accepts a JSON string FeatureCollection', () => {
    const json = JSON.stringify({
      type: 'FeatureCollection',
      features: [],
    });
    const r = importGeoJson(json);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.features).toHaveLength(0);
  });
});

// ─── Feature input ────────────────────────────────────────────────────────────

describe('importGeoJson — Feature input', () => {
  it('wraps a Feature in a FeatureCollection', () => {
    const input = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 20] },
      properties: { label: 'A' },
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('FeatureCollection');
      expect(r.data.features).toHaveLength(1);
      expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20] });
      expect(r.warnings).toEqual([]);
    }
  });
});

// ─── Geometry input ───────────────────────────────────────────────────────────

describe('importGeoJson — Geometry input', () => {
  it('wraps a Point geometry in Feature then FeatureCollection', () => {
    const input = { type: 'Point', coordinates: [5, 5] };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('FeatureCollection');
      expect(r.data.features).toHaveLength(1);
      expect(r.data.features[0]?.type).toBe('Feature');
      expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [5, 5] });
      expect(r.data.features[0]?.properties).toEqual({});
    }
  });

  it('wraps a Polygon geometry', () => {
    const input = {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.features[0]?.geometry?.type).toBe('Polygon');
  });

  it('wraps a LineString geometry', () => {
    const input = { type: 'LineString', coordinates: [[0, 0], [1, 1]] };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.features[0]?.geometry?.type).toBe('LineString');
  });
});

// ─── Normalization ────────────────────────────────────────────────────────────

describe('importGeoJson — normalization', () => {
  it('normalizes Feature.properties = null to {}', () => {
    const input = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: null,
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.features[0]?.properties).toEqual({});
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0]?.code).toBe('properties-normalized');
    }
  });

  it('normalizes numeric Feature.id to string', () => {
    const input = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {},
      id: 42,
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.features[0]?.id).toBe('42');
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0]?.code).toBe('id-normalized');
    }
  });

  it('emits both warnings when properties are null AND id is numeric', () => {
    const input = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: null,
      id: 7,
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.warnings).toHaveLength(2);
      expect(r.data.features[0]?.properties).toEqual({});
      expect(r.data.features[0]?.id).toBe('7');
    }
  });

  it('warnings array is always present even when empty', () => {
    const input = {
      type: 'FeatureCollection',
      features: [],
    };
    const r = importGeoJson(input);
    expect(r.success).toBe(true);
    if (r.success) expect(Array.isArray(r.warnings)).toBe(true);
  });

  it('warnings present on error branches too', () => {
    const r = importGeoJson(null);
    expect(Array.isArray(r.warnings)).toBe(true);
  });
});
