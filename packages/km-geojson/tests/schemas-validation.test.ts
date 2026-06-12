/**
 * Validation-rule coverage for the exported schemas (T-013).
 * Imports through the barrel (src/index) on purpose — verifies the public
 * surface re-exports and exercises every refine() callback.
 */
import { describe, expect, it } from 'vitest';
import {
  BoundingBoxSchema,
  GeoJsonGeometrySchema,
  GeoJsonSchema,
  LinearRingSchema,
} from '../src/index';

describe('BoundingBoxSchema refinements', () => {
  it('accepts a valid 2D bbox', () => {
    expect(BoundingBoxSchema.safeParse([-10, -5, 10, 5]).success).toBe(true);
  });
  it('rejects a 2D bbox with west > east', () => {
    expect(BoundingBoxSchema.safeParse([20, -5, 10, 5]).success).toBe(false);
  });
  it('accepts a valid 3D bbox', () => {
    expect(BoundingBoxSchema.safeParse([-10, -5, 0, 10, 5, 100]).success).toBe(true);
  });
  it('rejects a 3D bbox with south > north', () => {
    expect(BoundingBoxSchema.safeParse([-10, 50, 0, 10, 5, 100]).success).toBe(false);
  });
});

describe('LinearRingSchema refinements', () => {
  it('accepts a closed ring of 4 positions', () => {
    expect(LinearRingSchema.safeParse([[0, 0], [1, 0], [1, 1], [0, 0]]).success).toBe(true);
  });
  it('rejects an unclosed ring', () => {
    const r = LinearRingSchema.safeParse([[0, 0], [1, 0], [1, 1], [2, 2]]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toContain('ring-not-closed');
  });
  it('rejects a ring with fewer than 4 positions', () => {
    const r = LinearRingSchema.safeParse([[0, 0], [1, 0], [0, 0]]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toContain('ring-too-short');
  });
});

describe('recursive GeometryCollection (z.lazy)', () => {
  it('parses a nested GeometryCollection through the barrel export', () => {
    const nested = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [51.39, 35.69] },
        {
          type: 'GeometryCollection',
          geometries: [{ type: 'LineString', coordinates: [[0, 0], [1, 1]] }],
        },
      ],
    };
    expect(GeoJsonGeometrySchema.safeParse(nested).success).toBe(true);
    expect(GeoJsonSchema.safeParse(nested).success).toBe(true);
  });
  it('rejects an invalid nested geometry', () => {
    const bad = {
      type: 'GeometryCollection',
      geometries: [{ type: 'LineString', coordinates: [[0, 0]] }],
    };
    expect(GeoJsonGeometrySchema.safeParse(bad).success).toBe(false);
  });
});
