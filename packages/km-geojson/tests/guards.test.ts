import { describe, it, expect } from 'vitest';
import { isGeoJsonGeometry } from '../src/guards';

// ─── isGeoJsonGeometry ────────────────────────────────────────────────────────

describe('isGeoJsonGeometry', () => {
  it('returns true for a valid Point', () => {
    expect(isGeoJsonGeometry({ type: 'Point', coordinates: [0, 0] })).toBe(true);
  });

  it('returns true for a valid LineString', () => {
    expect(
      isGeoJsonGeometry({ type: 'LineString', coordinates: [[0, 0], [1, 1]] }),
    ).toBe(true);
  });

  it('returns true for a valid Polygon', () => {
    expect(
      isGeoJsonGeometry({
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
      }),
    ).toBe(true);
  });

  it('returns true for a valid GeometryCollection', () => {
    expect(
      isGeoJsonGeometry({
        type: 'GeometryCollection',
        geometries: [{ type: 'Point', coordinates: [0, 0] }],
      }),
    ).toBe(true);
  });

  it('returns false for a Feature', () => {
    expect(
      isGeoJsonGeometry({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: null,
      }),
    ).toBe(false);
  });

  it('returns false for a FeatureCollection', () => {
    expect(
      isGeoJsonGeometry({ type: 'FeatureCollection', features: [] }),
    ).toBe(false);
  });

  it('returns false for a plain object without type', () => {
    expect(isGeoJsonGeometry({ x: 1, y: 2 })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isGeoJsonGeometry(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isGeoJsonGeometry('Point')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isGeoJsonGeometry(42)).toBe(false);
  });
});
