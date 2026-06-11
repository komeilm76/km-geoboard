/**
 * Bounding-box (BoundingBox) utility functions.
 *
 * All bounding boxes are in the form `[west, south, east, north]` in WGS84 degrees
 * (the geographic / GeoJSON convention). Latitude and longitude operations are
 * inclusive on their boundaries.
 */

import type { LatLng, BoundingBox } from './types';

// ─── boundsFromLatLngs ────────────────────────────────────────────────────────

/**
 * Computes the minimum bounding box that contains all of the given coordinates.
 *
 * @param coords - Non-empty array of `LatLng` values.
 * @returns `BoundingBox` as `[west, south, east, north]`.
 *
 * @example
 * boundsFromLatLngs([
 *   { lat: 51.5, lng: -0.1 },
 *   { lat: 48.8, lng: 2.3 },
 * ]); // [-0.1, 48.8, 2.3, 51.5]
 */
export function boundsFromLatLngs(coords: LatLng[]): BoundingBox {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const { lat, lng } of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  return [minLng, minLat, maxLng, maxLat];
}

// ─── boundsCenter ─────────────────────────────────────────────────────────────

/**
 * Returns the geographic center of a bounding box.
 *
 * @param bounds - `[west, south, east, north]` in degrees.
 * @returns Center `LatLng`.
 *
 * @example
 * boundsCenter([-10, -10, 10, 10]); // { lat: 0, lng: 0 }
 */
export function boundsCenter(bounds: BoundingBox): LatLng {
  const [west, south, east, north] = bounds;
  return {
    lat: (south + north) / 2,
    lng: (west + east) / 2,
  };
}

// ─── boundsContains ───────────────────────────────────────────────────────────

/**
 * Returns `true` if `point` lies within or on the boundary of `bounds`.
 *
 * All comparisons are inclusive (points on the boundary count as contained).
 *
 * @param bounds - `[west, south, east, north]` in degrees.
 * @param point  - `LatLng` to test.
 * @returns `true` if the point is inside or on the boundary.
 *
 * @example
 * boundsContains([-10, -10, 10, 10], { lat: 0, lng: 0 });  // true
 * boundsContains([-10, -10, 10, 10], { lat: 10, lng: 10 }); // true  (on edge)
 * boundsContains([-10, -10, 10, 10], { lat: 11, lng: 0 });  // false
 */
export function boundsContains(bounds: BoundingBox, point: LatLng): boolean {
  const [west, south, east, north] = bounds;
  return (
    point.lng >= west &&
    point.lng <= east &&
    point.lat >= south &&
    point.lat <= north
  );
}

// ─── boundsIntersect ──────────────────────────────────────────────────────────

/**
 * Returns `true` if two bounding boxes overlap or touch at their edges.
 *
 * Uses the axis-separation test: two boxes do NOT intersect if and only if
 * one is entirely to the left, right, above, or below the other.
 * Touching edges count as intersection.
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns `true` if the boxes intersect (including touching on an edge).
 *
 * @example
 * boundsIntersect([-10,-10,10,10], [5,5,20,20]);  // true
 * boundsIntersect([-10,-10,10,10], [10,10,20,20]); // true  (touching corner)
 * boundsIntersect([-10,-10,10,10], [11,0,20,20]);  // false
 */
export function boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
  const [aWest, aSouth, aEast, aNorth] = a;
  const [bWest, bSouth, bEast, bNorth] = b;
  // Boxes do NOT intersect if one is entirely outside the other on any axis
  return !(aEast < bWest || bEast < aWest || aNorth < bSouth || bNorth < aSouth);
}

// ─── boundsExpand ─────────────────────────────────────────────────────────────

/**
 * Expands (or contracts) a bounding box by a buffer amount in degrees on every side.
 *
 * A positive `bufferDegrees` grows the box; negative shrinks it.
 * If a negative buffer would invert the box (buffer exceeds half the box size),
 * the result is clamped so that `west <= east` and `south <= north` — the box
 * collapses to its center point rather than inverting.
 *
 * @param bounds        - `[west, south, east, north]` in degrees.
 * @param bufferDegrees - Amount to add/remove from each edge (in degrees).
 * @returns Expanded/contracted `BoundingBox`.
 *
 * @example
 * boundsExpand([0, 0, 10, 10], 1); // [-1, -1, 11, 11]
 * boundsExpand([0, 0, 10, 10], -6); // [5, 5, 5, 5] — collapsed to center
 */
export function boundsExpand(bounds: BoundingBox, bufferDegrees: number): BoundingBox {
  const [west, south, east, north] = bounds;
  const centerLng = (west + east) / 2;
  const centerLat = (south + north) / 2;

  const newWest  = Math.min(west  - bufferDegrees, centerLng);
  const newSouth = Math.min(south - bufferDegrees, centerLat);
  const newEast  = Math.max(east  + bufferDegrees, centerLng);
  const newNorth = Math.max(north + bufferDegrees, centerLat);

  return [newWest, newSouth, newEast, newNorth];
}

// ─── boundsUnion ──────────────────────────────────────────────────────────────

/**
 * Returns the smallest bounding box that contains both input boxes.
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns Union `BoundingBox`.
 *
 * @example
 * boundsUnion([-10, -10, 0, 0], [0, 0, 10, 10]); // [-10, -10, 10, 10]
 */
export function boundsUnion(a: BoundingBox, b: BoundingBox): BoundingBox {
  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ];
}
