import { describe, it, expect } from 'vitest';
import {
  boundsFromLatLngs,
  boundsCenter,
  boundsContains,
  boundsIntersect,
  boundsExpand,
  boundsUnion,
} from '../src/bounds';

// ─── boundsFromLatLngs ────────────────────────────────────────────────────────

describe('boundsFromLatLngs', () => {
  it('wraps a single point', () => {
    const result = boundsFromLatLngs([{ lat: 10, lng: 20 }]);
    expect(result).toEqual([20, 10, 20, 10]);
  });

  it('computes correct bounds for multiple points', () => {
    const result = boundsFromLatLngs([
      { lat: 51.5, lng: -0.1 },
      { lat: 48.8, lng: 2.3 },
      { lat: 55.0, lng: -3.2 },
    ]);
    const [west, south, east, north] = result;
    expect(west).toBeCloseTo(-3.2, 5);
    expect(south).toBeCloseTo(48.8, 5);
    expect(east).toBeCloseTo(2.3, 5);
    expect(north).toBeCloseTo(55.0, 5);
  });

  it('west <= east and south <= north', () => {
    const result = boundsFromLatLngs([
      { lat: -10, lng: 50 },
      { lat: 10, lng: -50 },
    ]);
    expect(result[0]).toBeLessThanOrEqual(result[2]);
    expect(result[1]).toBeLessThanOrEqual(result[3]);
  });
});

// ─── boundsCenter ─────────────────────────────────────────────────────────────

describe('boundsCenter', () => {
  it('returns center of a symmetric box', () => {
    const center = boundsCenter([-10, -10, 10, 10]);
    expect(center.lat).toBeCloseTo(0, 5);
    expect(center.lng).toBeCloseTo(0, 5);
  });

  it('returns correct center for an asymmetric box', () => {
    const center = boundsCenter([0, 0, 20, 10]);
    expect(center.lat).toBeCloseTo(5, 5);
    expect(center.lng).toBeCloseTo(10, 5);
  });
});

// ─── boundsContains ───────────────────────────────────────────────────────────

describe('boundsContains', () => {
  const box: [number, number, number, number] = [-10, -10, 10, 10];

  it('returns true for a point inside', () => {
    expect(boundsContains(box, { lat: 0, lng: 0 })).toBe(true);
  });

  it('returns true for a point on the west edge', () => {
    expect(boundsContains(box, { lat: 0, lng: -10 })).toBe(true);
  });

  it('returns true for a point on the north edge', () => {
    expect(boundsContains(box, { lat: 10, lng: 0 })).toBe(true);
  });

  it('returns true for a corner point', () => {
    expect(boundsContains(box, { lat: 10, lng: 10 })).toBe(true);
  });

  it('returns false for a point outside', () => {
    expect(boundsContains(box, { lat: 11, lng: 0 })).toBe(false);
    expect(boundsContains(box, { lat: 0, lng: -11 })).toBe(false);
  });
});

// ─── boundsIntersect ──────────────────────────────────────────────────────────

describe('boundsIntersect', () => {
  it('returns true for overlapping boxes', () => {
    expect(boundsIntersect([-10, -10, 10, 10], [5, 5, 20, 20])).toBe(true);
  });

  it('returns true for boxes touching on an edge', () => {
    // east edge of a touches west edge of b
    expect(boundsIntersect([-10, -10, 10, 10], [10, -10, 20, 10])).toBe(true);
  });

  it('returns true for boxes touching at a corner', () => {
    expect(boundsIntersect([-10, -10, 10, 10], [10, 10, 20, 20])).toBe(true);
  });

  it('returns false for separated boxes', () => {
    expect(boundsIntersect([-10, -10, 0, 0], [1, 1, 10, 10])).toBe(false);
  });

  it('returns true for one box inside another', () => {
    expect(boundsIntersect([-10, -10, 10, 10], [-5, -5, 5, 5])).toBe(true);
  });
});

// ─── boundsExpand ─────────────────────────────────────────────────────────────

describe('boundsExpand', () => {
  it('grows the box by the buffer amount', () => {
    const result = boundsExpand([0, 0, 10, 10], 1);
    expect(result).toEqual([-1, -1, 11, 11]);
  });

  it('shrinks the box with a negative buffer', () => {
    const result = boundsExpand([0, 0, 10, 10], -2);
    expect(result).toEqual([2, 2, 8, 8]);
  });

  it('clamps to center when negative buffer exceeds half the box size', () => {
    const result = boundsExpand([0, 0, 10, 10], -10);
    const [west, south, east, north] = result;
    // Should not invert — collapse to center
    expect(west).toBeLessThanOrEqual(east);
    expect(south).toBeLessThanOrEqual(north);
  });
});

// ─── boundsUnion ──────────────────────────────────────────────────────────────

describe('boundsUnion', () => {
  it('returns the bounding box containing both inputs', () => {
    const result = boundsUnion([-10, -10, 0, 0], [0, 0, 10, 10]);
    expect(result).toEqual([-10, -10, 10, 10]);
  });

  it('union with self is the same box', () => {
    const box: [number, number, number, number] = [-5, -5, 5, 5];
    expect(boundsUnion(box, box)).toEqual(box);
  });

  it('result west <= east and south <= north', () => {
    const result = boundsUnion([50, 20, 60, 30], [-10, -20, 0, 0]);
    expect(result[0]).toBeLessThanOrEqual(result[2]);
    expect(result[1]).toBeLessThanOrEqual(result[3]);
  });
});
