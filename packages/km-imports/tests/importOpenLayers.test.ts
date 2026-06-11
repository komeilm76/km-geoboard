import { describe, it, expect } from 'vitest';
import { importOpenLayers } from '../src/importOpenLayers';

const BASIC_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} },
  ],
};

// ─── Standard GeoJSON (no crs field) ─────────────────────────────────────────

describe('importOpenLayers — standard GeoJSON', () => {
  it('passes through a standard FeatureCollection with no warnings', () => {
    const r = importOpenLayers(BASIC_FEATURE_COLLECTION);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('FeatureCollection');
      expect(r.data.features).toHaveLength(1);
      expect(r.warnings).toEqual([]);
    }
  });

  it('accepts a JSON string', () => {
    const r = importOpenLayers(JSON.stringify(BASIC_FEATURE_COLLECTION));
    expect(r.success).toBe(true);
  });
});

// ─── OpenLayers with crs = EPSG:4326 (no warning) ────────────────────────────

describe('importOpenLayers — crs = EPSG:4326', () => {
  it('strips crs but emits no warning when crs is EPSG:4326', () => {
    const input = {
      ...BASIC_FEATURE_COLLECTION,
      crs: 'EPSG:4326',
    };
    const r = importOpenLayers(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.warnings).toEqual([]);
      // crs field must be stripped from output data
      expect((r.data as Record<string, unknown>)['crs']).toBeUndefined();
    }
  });

  it('handles OGC-format crs: EPSG:4326 (no warning)', () => {
    const input = {
      ...BASIC_FEATURE_COLLECTION,
      crs: { type: 'name', properties: { name: 'EPSG:4326' } },
    };
    const r = importOpenLayers(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.warnings).toEqual([]);
  });
});

// ─── OpenLayers with crs = EPSG:3857 (warning emitted) ───────────────────────

describe('importOpenLayers — non-EPSG:4326 crs', () => {
  it('emits crs-stripped warning when crs is EPSG:3857', () => {
    const input = {
      ...BASIC_FEATURE_COLLECTION,
      crs: 'EPSG:3857',
    };
    const r = importOpenLayers(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0]?.code).toBe('crs-stripped');
      expect(r.warnings[0]?.context).toBe('EPSG:3857');
    }
  });

  it('emits warning for OGC-format EPSG:3857', () => {
    const input = {
      ...BASIC_FEATURE_COLLECTION,
      crs: { type: 'name', properties: { name: 'EPSG:3857' } },
    };
    const r = importOpenLayers(input);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.warnings[0]?.code).toBe('crs-stripped');
    }
  });

  it('merges crs warning with geojson warnings', () => {
    const input = {
      type: 'FeatureCollection',
      crs: 'EPSG:3857',
      features: [
        // null properties will trigger a geojson normalization warning
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: null },
      ],
    };
    const r = importOpenLayers(input);
    expect(r.success).toBe(true);
    if (r.success) {
      // expect at least the crs warning + properties-normalized warning
      expect(r.warnings.length).toBeGreaterThanOrEqual(2);
      const codes = r.warnings.map((w) => w.code);
      expect(codes).toContain('crs-stripped');
      expect(codes).toContain('properties-normalized');
    }
  });
});

// ─── Error paths ──────────────────────────────────────────────────────────────

describe('importOpenLayers — errors', () => {
  it('returns empty-input for null', () => {
    const r = importOpenLayers(null);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
  });

  it('returns invalid-json for malformed string', () => {
    const r = importOpenLayers('not json');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('invalid-json');
  });

  it('returns schema-mismatch for invalid GeoJSON object', () => {
    const r = importOpenLayers({ foo: 'bar' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('schema-mismatch');
  });
});
