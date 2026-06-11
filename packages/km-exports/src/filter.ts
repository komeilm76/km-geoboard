/**
 * @file filter.ts
 * Shared export-filter utility used by all serialization functions.
 */

import type { ExportFilter, GeoJsonFeature, GeoJsonGeometry } from './types';

// ─── Geometry bounding-box helper ────────────────────────────────────────────
// (Would come from km-geojson in the full monorepo.)

type Bbox4 = [number, number, number, number];

/**
 * Collect all coordinate pairs from a GeoJSON geometry, recursively.
 * Returns `null` when the geometry is a GeometryCollection with no children.
 */
function collectPositions(geometry: GeoJsonGeometry): [number, number][] {
  switch (geometry.type) {
    case 'Point':
      return [[geometry.coordinates[0], geometry.coordinates[1]]];

    case 'MultiPoint':
      return geometry.coordinates.map((p) => [p[0], p[1]] as [number, number]);

    case 'LineString':
      return geometry.coordinates.map((p) => [p[0], p[1]] as [number, number]);

    case 'MultiLineString':
      return geometry.coordinates.flat().map((p) => [p[0], p[1]] as [number, number]);

    case 'Polygon':
      return geometry.coordinates.flat().map((p) => [p[0], p[1]] as [number, number]);

    case 'MultiPolygon':
      return geometry.coordinates.flat(2).map((p) => [p[0], p[1]] as [number, number]);

    case 'GeometryCollection':
      return geometry.geometries.flatMap(collectPositions);
  }
}

/**
 * Compute the [minX, minY, maxX, maxY] bounding box of a GeoJSON geometry.
 * Returns `null` when the geometry has no positions.
 */
export function getGeometryBoundingBox(geometry: GeoJsonGeometry): Bbox4 | null {
  const positions = collectPositions(geometry);
  if (positions.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of positions) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

// ─── Bounding-box intersection helper ────────────────────────────────────────

/**
 * Returns true when two axis-aligned bounding boxes intersect (inclusive).
 */
function bboxIntersects(
  [minX1, minY1, maxX1, maxY1]: Bbox4,
  [minX2, minY2, maxX2, maxY2]: Bbox4,
): boolean {
  return maxX1 >= minX2 && minX1 <= maxX2 && maxY1 >= minY2 && minY1 <= maxY2;
}

/**
 * Attempt to derive a bounding box from an SVG element or GeoJSON feature.
 * Returns `null` when no geometry can be determined (conservative: keep item).
 */
function itemBbox(item: unknown): Bbox4 | null {
  if (item === null || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;

  // GeoJSON Feature
  if (obj['type'] === 'Feature') {
    const feature = item as GeoJsonFeature;
    if (feature.geometry === null) return null;
    return getGeometryBoundingBox(feature.geometry);
  }

  // SVG rect
  if (obj['type'] === 'rect') {
    const x = obj['x'] as number | undefined;
    const y = obj['y'] as number | undefined;
    const w = obj['width'] as number | undefined;
    const h = obj['height'] as number | undefined;
    if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
      return [x, y, x + w, y + h];
    }
  }

  // SVG circle / ellipse
  if (obj['type'] === 'circle') {
    const cx = obj['cx'] as number | undefined;
    const cy = obj['cy'] as number | undefined;
    const r  = obj['r']  as number | undefined;
    if (cx !== undefined && cy !== undefined && r !== undefined) {
      return [cx - r, cy - r, cx + r, cy + r];
    }
  }
  if (obj['type'] === 'ellipse') {
    const cx = obj['cx'] as number | undefined;
    const cy = obj['cy'] as number | undefined;
    const rx = obj['rx'] as number | undefined;
    const ry = obj['ry'] as number | undefined;
    if (cx !== undefined && cy !== undefined && rx !== undefined && ry !== undefined) {
      return [cx - rx, cy - ry, cx + rx, cy + ry];
    }
  }

  // SVG line
  if (obj['type'] === 'line') {
    const x1 = obj['x1'] as number | undefined;
    const y1 = obj['y1'] as number | undefined;
    const x2 = obj['x2'] as number | undefined;
    const y2 = obj['y2'] as number | undefined;
    if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
      return [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)];
    }
  }

  // SVG polyline / polygon
  if (obj['type'] === 'polyline' || obj['type'] === 'polygon') {
    const pts = obj['points'] as [number, number][] | undefined;
    if (pts && pts.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [px, py] of pts) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
      return [minX, minY, maxX, maxY];
    }
  }

  // SVG text
  if (obj['type'] === 'text') {
    const x = obj['x'] as number | undefined;
    const y = obj['y'] as number | undefined;
    if (x !== undefined && y !== undefined) {
      return [x, y, x, y];
    }
  }

  // No geometry found — keep item conservatively
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Applies an {@link ExportFilter} to an array of items, returning only those
 * that pass all active filter steps.
 *
 * Filter steps are applied in this fixed order:
 * 1. `includeIds`   — keep only items whose `id` is in the set (skipped if empty/undefined).
 * 2. `excludeIds`   — remove items whose `id` is in the set.
 * 3. `includeLayers`— keep only items whose `layer` matches (skipped if empty/undefined).
 * 4. `excludeLayers`— remove items whose `layer` matches.
 * 5. `boundingBox`  — remove items that do not intersect the box.
 *                     Items with no detectable geometry are kept conservatively.
 *
 * When `filter` is `undefined`, the original array is returned unchanged.
 *
 * @param items  - Array of items to filter.
 * @param filter - Optional filter descriptor.
 * @returns Filtered array (new array; original is not mutated).
 *
 * @example
 * const visible = applyExportFilter(elements, { includeIds: ['a', 'b'] });
 */
export function applyExportFilter<T extends { id?: string | number }>(
  items: T[],
  filter?: ExportFilter,
): T[] {
  if (!filter) return items;

  let result = items.slice();

  // Step 1 — includeIds
  if (filter.includeIds && filter.includeIds.length > 0) {
    const ids = new Set<string | number>(filter.includeIds);
    result = result.filter((item) => item.id !== undefined && ids.has(String(item.id)));
  }

  // Step 2 — excludeIds
  if (filter.excludeIds && filter.excludeIds.length > 0) {
    const ids = new Set<string | number>(filter.excludeIds);
    result = result.filter((item) => item.id === undefined || !ids.has(String(item.id)));
  }

  // Step 3 — includeLayers
  if (filter.includeLayers && filter.includeLayers.length > 0) {
    const layers = new Set(filter.includeLayers);
    result = result.filter((item) => {
      const layer = (item as Record<string, unknown>)['layer'];
      // If no layer property, keep conservatively
      if (layer === undefined) return true;
      return layers.has(String(layer));
    });
  }

  // Step 4 — excludeLayers
  if (filter.excludeLayers && filter.excludeLayers.length > 0) {
    const layers = new Set(filter.excludeLayers);
    result = result.filter((item) => {
      const layer = (item as Record<string, unknown>)['layer'];
      if (layer === undefined) return true;
      return !layers.has(String(layer));
    });
  }

  // Step 5 — boundingBox
  if (filter.boundingBox) {
    const box = filter.boundingBox;
    result = result.filter((item) => {
      const bbox = itemBbox(item);
      // No detectable geometry → keep conservatively
      if (bbox === null) return true;
      return bboxIntersects(bbox, box);
    });
  }

  return result;
}
