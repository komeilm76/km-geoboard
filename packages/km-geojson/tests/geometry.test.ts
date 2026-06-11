import { describe, it, expect } from 'vitest';
import { getGeometryBoundingBox, flattenGeometryCollection } from '../src/geometry';
import type {
  GeoJsonPoint,
  GeoJsonLineString,
  GeoJsonPolygon,
  GeoJsonMultiPolygon,
  GeoJsonGeometryCollection,
} from '../src/types';

// ─── getGeometryBoundingBox ───────────────────────────────────────────────────

describe('getGeometryBoundingBox', () => {
  it('returns bbox for a Point', () => {
    const point: GeoJsonPoint = { type: 'Point', coordinates: [10, 20] };
    expect(getGeometryBoundingBox(point)).toEqual([10, 20, 10, 20]);
  });

  it('returns bbox for a LineString', () => {
    const line: GeoJsonLineString = {
      type: 'LineString',
      coordinates: [
        [-10, 5],
        [10, -5],
        [0, 15],
      ],
    };
    expect(getGeometryBoundingBox(line)).toEqual([-10, -5, 10, 15]);
  });

  it('returns bbox for a Polygon', () => {
    const polygon: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 4],
          [0, 0],
        ],
      ],
    };
    expect(getGeometryBoundingBox(polygon)).toEqual([0, 0, 4, 4]);
  });

  it('returns bbox for a MultiPolygon', () => {
    const multi: GeoJsonMultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
        [
          [
            [5, 5],
            [10, 5],
            [10, 10],
            [5, 10],
            [5, 5],
          ],
        ],
      ],
    };
    expect(getGeometryBoundingBox(multi)).toEqual([0, 0, 10, 10]);
  });

  it('returns bbox for a GeometryCollection', () => {
    const collection: GeoJsonGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [-5, -5] },
        { type: 'Point', coordinates: [5, 5] },
      ],
    };
    expect(getGeometryBoundingBox(collection)).toEqual([-5, -5, 5, 5]);
  });

  it('handles nested GeometryCollection', () => {
    const nested: GeoJsonGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [0, 0] },
        {
          type: 'GeometryCollection',
          geometries: [{ type: 'Point', coordinates: [100, 80] }],
        },
      ],
    };
    expect(getGeometryBoundingBox(nested)).toEqual([0, 0, 100, 80]);
  });
});

// ─── flattenGeometryCollection ────────────────────────────────────────────────

describe('flattenGeometryCollection', () => {
  it('wraps a non-collection geometry in an array', () => {
    const point: GeoJsonPoint = { type: 'Point', coordinates: [0, 0] };
    expect(flattenGeometryCollection(point)).toEqual([point]);
  });

  it('flattens a flat GeometryCollection', () => {
    const col: GeoJsonGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [0, 0] },
        { type: 'Point', coordinates: [1, 1] },
      ],
    };
    const flat = flattenGeometryCollection(col);
    expect(flat).toHaveLength(2);
    expect(flat[0]?.type).toBe('Point');
    expect(flat[1]?.type).toBe('Point');
  });

  it('recursively flattens nested GeometryCollections (3 levels)', () => {
    const col: GeoJsonGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [0, 0] },
        {
          type: 'GeometryCollection',
          geometries: [
            { type: 'Point', coordinates: [1, 1] },
            {
              type: 'GeometryCollection',
              geometries: [{ type: 'Point', coordinates: [2, 2] }],
            },
          ],
        },
      ],
    };
    const flat = flattenGeometryCollection(col);
    expect(flat).toHaveLength(3);
    expect(flat.every((g) => g.type === 'Point')).toBe(true);
  });

  it('returns empty array for empty GeometryCollection', () => {
    const col: GeoJsonGeometryCollection = { type: 'GeometryCollection', geometries: [] };
    expect(flattenGeometryCollection(col)).toEqual([]);
  });

  it('does not include GeometryCollection in output', () => {
    const col: GeoJsonGeometryCollection = {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'GeometryCollection',
          geometries: [{ type: 'Point', coordinates: [0, 0] }],
        },
      ],
    };
    const flat = flattenGeometryCollection(col);
    expect(flat.every((g) => g.type !== 'GeometryCollection')).toBe(true);
  });
});
