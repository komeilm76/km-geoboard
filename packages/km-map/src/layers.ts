/**
 * Layer format detection and source object helpers.
 *
 * These utilities produce configuration objects compatible with MapLibre GL JS
 * sources and layers. They do NOT import MapLibre — they return plain objects
 * that conform to the expected shape. Consumers wire these into their map library.
 */

import type { SupportedLayerFormat } from './types';
import type { GeoJsonFeatureCollection } from 'km-geojson';

// ─── detectLayerFormat ────────────────────────────────────────────────────────

/**
 * Heuristically detects the format of a layer source from a URL string or
 * a serialized data string.
 *
 * Detection rules (evaluated in order):
 * 1. URL ends with `.geojson` or `.json` → `"geojson"`
 * 2. URL contains `/{z}/{x}/{y}` → `"xyz"`
 * 3. URL contains `/wmts` or `SERVICE=WMTS` (case-insensitive) → `"wmts"`
 * 4. URL contains `/wms` or `SERVICE=WMS` (case-insensitive) → `"wms"`
 * 5. URL ends with `.kml` → `"kml"`
 * 6. URL ends with `.gpx` → `"gpx"`
 * 7. URL ends with `.mvt` or `.pbf` → `"mvt"`
 * 8. Otherwise → `"unknown"`
 *
 * @param input - URL string or raw data string.
 * @returns `SupportedLayerFormat` or `"unknown"`.
 *
 * @example
 * detectLayerFormat("https://example.com/data.geojson"); // "geojson"
 * detectLayerFormat("https://tile.example.com/{z}/{x}/{y}.png"); // "xyz"
 * detectLayerFormat("https://geo.example.com/wms?SERVICE=WMS&..."); // "wms"
 * detectLayerFormat("https://example.com/something"); // "unknown"
 */
export function detectLayerFormat(input: string): SupportedLayerFormat | 'unknown' {
  const lower = input.toLowerCase();

  // Strip query string for extension checks
  const pathOnly = lower.split('?')[0] ?? lower;

  if (pathOnly.endsWith('.geojson') || pathOnly.endsWith('.json')) return 'geojson';
  if (lower.includes('/{z}/{x}/{y}')) return 'xyz';
  if (lower.includes('/wmts') || lower.includes('service=wmts')) return 'wmts';
  if (lower.includes('/wms') || lower.includes('service=wms')) return 'wms';
  if (pathOnly.endsWith('.kml')) return 'kml';
  if (pathOnly.endsWith('.gpx')) return 'gpx';
  if (pathOnly.endsWith('.mvt') || pathOnly.endsWith('.pbf')) return 'mvt';

  return 'unknown';
}

// ─── makeGeoJsonSource ────────────────────────────────────────────────────────

/**
 * Produces a MapLibre GL JS-compatible GeoJSON source object.
 *
 * This function returns a plain object — it does not import or reference
 * MapLibre. Pass the result directly to `map.addSource(id, source)`.
 *
 * @param data - A GeoJSON `FeatureCollection` object or a URL string pointing
 *               to a `.geojson` file.
 * @returns A source object `{ type: "geojson", data }`.
 *
 * @example
 * makeGeoJsonSource("https://example.com/data.geojson");
 * // { type: "geojson", data: "https://example.com/data.geojson" }
 *
 * makeGeoJsonSource({ type: "FeatureCollection", features: [] });
 * // { type: "geojson", data: { type: "FeatureCollection", features: [] } }
 */
export function makeGeoJsonSource(data: GeoJsonFeatureCollection | string): {
  type: 'geojson';
  data: GeoJsonFeatureCollection | string;
} {
  return { type: 'geojson', data };
}

// ─── makeXyzSource ────────────────────────────────────────────────────────────

/**
 * Produces a MapLibre GL JS-compatible raster source object for XYZ tiles.
 *
 * This function returns a plain object — it does not import or reference
 * MapLibre. Pass the result directly to `map.addSource(id, source)`.
 *
 * @param url      - Tile URL template using `{z}`, `{x}`, `{y}` placeholders.
 *                   Example: `"https://tile.openstreetmap.org/{z}/{x}/{y}.png"`
 * @param tileSize - Tile size in pixels. Must be `256` or `512`. Defaults to `256`.
 * @returns A source object `{ type: "raster", tiles: [url], tileSize }`.
 *
 * @example
 * makeXyzSource("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
 * // { type: "raster", tiles: ["https://..."], tileSize: 256 }
 *
 * makeXyzSource("https://example.com/{z}/{x}/{y}.png", 512);
 * // { type: "raster", tiles: ["https://..."], tileSize: 512 }
 */
export function makeXyzSource(
  url: string,
  tileSize: 256 | 512 = 256,
): {
  type: 'raster';
  tiles: string[];
  tileSize: number;
} {
  return { type: 'raster', tiles: [url], tileSize };
}
