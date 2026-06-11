/**
 * GeoJSON geometry utility functions.
 * Bounding box computation and geometry collection flattening.
 */

import type {
  Position,
  GeoJsonGeometry,
  GeoJsonGeometryCollection,
} from './types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Collects all Position values from any geometry type (recursive).
 * @internal
 */
function allPositions(geometry: GeoJsonGeometry): Position[] {
  switch (geometry.type) {
    case 'Point':
      return [geometry.coordinates];

    case 'MultiPoint':
      return geometry.coordinates;

    case 'LineString':
      return geometry.coordinates;

    case 'MultiLineString':
      return geometry.coordinates.flat();

    case 'Polygon':
      return geometry.coordinates.flat();

    case 'MultiPolygon':
      return geometry.coordinates.flat(2);

    case 'GeometryCollection':
      return geometry.geometries.flatMap(allPositions);
  }
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Computes the bounding box `[west, south, east, north]` for any GeoJSON geometry.
 *
 * Walks all positions in the geometry (including nested GeometryCollections)
 * and returns the minimum enclosing bounding box.
 *
 * @param geometry - Any GeoJSON geometry object.
 * @returns `[west, south, east, north]` as a 4-element tuple of numbers.
 *
 * @example
 * const bbox = getGeometryBoundingBox({ type: 'Point', coordinates: [-0.1276, 51.5074] });
 * // [-0.1276, 51.5074, -0.1276, 51.5074]
 */
export function getGeometryBoundingBox(
  geometry: GeoJsonGeometry,
): [number, number, number, number] {
  const positions = allPositions(geometry);

  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const pos of positions) {
    const lng = pos[0];
    const lat = pos[1];
    if (lng < west) west = lng;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lat > north) north = lat;
  }

  return [west, south, east, north];
}

/**
 * Recursively flattens a `GeoJsonGeometryCollection` into an array of
 * non-collection geometry objects.
 *
 * If the input is not a `GeometryCollection`, it is returned in a single-element array.
 * Nested `GeometryCollection` objects are flattened recursively.
 *
 * @param geometry - Any GeoJSON geometry object.
 * @returns A flat array of primitive geometry objects (no GeometryCollections).
 *
 * @example
 * const flat = flattenGeometryCollection({
 *   type: 'GeometryCollection',
 *   geometries: [
 *     { type: 'Point', coordinates: [0, 0] },
 *     {
 *       type: 'GeometryCollection',
 *       geometries: [{ type: 'Point', coordinates: [1, 1] }],
 *     },
 *   ],
 * });
 * // [{ type: 'Point', coordinates: [0, 0] }, { type: 'Point', coordinates: [1, 1] }]
 */
export function flattenGeometryCollection(
  geometry: GeoJsonGeometry,
): Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>[] {
  if (geometry.type !== 'GeometryCollection') {
    return [geometry as Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>];
  }

  const result: Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>[] = [];
  for (const child of geometry.geometries) {
    result.push(...flattenGeometryCollection(child));
  }
  return result;
}
