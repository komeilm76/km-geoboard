import { describe, it, expect } from 'vitest';
import {
  parseGeoJson,
  parseGeoJsonFeature,
  parseGeoJsonFeatureCollection,
} from '../src/parse';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validPoint = { type: 'Point', coordinates: [-0.1276, 51.5074] };

const validFeature = {
  type: 'Feature',
  geometry: validPoint,
  properties: { name: 'London' },
};

const featureWithNullGeometry = {
  type: 'Feature',
  geometry: null,
  properties: null,
};

const validCollection = {
  type: 'FeatureCollection',
  features: [validFeature],
};

const ringNotClosed = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1], // last ≠ first — ring not closed
    ],
  ],
};

// ─── parseGeoJson ─────────────────────────────────────────────────────────────

describe('parseGeoJson', () => {
  it('parses a valid Point geometry', () => {
    const result = parseGeoJson(validPoint);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('Point');
    }
  });

  it('parses a valid FeatureCollection', () => {
    const result = parseGeoJson(validCollection);
    expect(result.success).toBe(true);
  });

  it('parses a Feature with null geometry', () => {
    const result = parseGeoJson(featureWithNullGeometry);
    expect(result.success).toBe(true);
  });

  it('returns failure for invalid JSON (null)', () => {
    const result = parseGeoJson(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid-input');
    }
  });

  it('returns failure for a plain object with no type', () => {
    const result = parseGeoJson({ foo: 'bar' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid-input');
    }
  });

  it('returns failure for a polygon with ring-not-closed', () => {
    const result = parseGeoJson(ringNotClosed);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid-input');
      expect(result.error.message).toMatch(/ring-not-closed/i);
    }
  });

  it('returns failure for a string', () => {
    const result = parseGeoJson('not geojson');
    expect(result.success).toBe(false);
  });
});

// ─── parseGeoJsonFeature ──────────────────────────────────────────────────────

describe('parseGeoJsonFeature', () => {
  it('parses a valid Feature', () => {
    const result = parseGeoJsonFeature(validFeature);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('Feature');
      expect(result.data.properties).toEqual({ name: 'London' });
    }
  });

  it('parses a Feature with null geometry and null properties', () => {
    const result = parseGeoJsonFeature(featureWithNullGeometry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.geometry).toBeNull();
      expect(result.data.properties).toBeNull();
    }
  });

  it('parses a Feature with an id', () => {
    const withId = { ...validFeature, id: 42 };
    const result = parseGeoJsonFeature(withId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it('returns failure for a geometry (not a Feature)', () => {
    const result = parseGeoJsonFeature(validPoint);
    expect(result.success).toBe(false);
  });

  it('returns failure for null', () => {
    const result = parseGeoJsonFeature(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid-input');
    }
  });
});

// ─── parseGeoJsonFeatureCollection ───────────────────────────────────────────

describe('parseGeoJsonFeatureCollection', () => {
  it('parses a valid FeatureCollection', () => {
    const result = parseGeoJsonFeatureCollection(validCollection);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('FeatureCollection');
      expect(result.data.features).toHaveLength(1);
    }
  });

  it('parses an empty FeatureCollection', () => {
    const result = parseGeoJsonFeatureCollection({ type: 'FeatureCollection', features: [] });
    expect(result.success).toBe(true);
  });

  it('returns failure for a Feature (not a collection)', () => {
    const result = parseGeoJsonFeatureCollection(validFeature);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid-input');
    }
  });
});
