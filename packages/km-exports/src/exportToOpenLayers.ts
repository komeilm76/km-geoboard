/**
 * @file exportToOpenLayers.ts
 * Serializes features to an OpenLayers-compatible GeoJSON string.
 *
 * This is structurally identical to a standard GeoJSON FeatureCollection, with
 * an optional `crs` field added when the projection differs from EPSG:4326.
 *
 * Round-trip partner: `importOpenLayers` (from km-imports).
 */

import type { Result, OpenLayersExportOptions } from './types';
import { exportToGeoJson } from './exportToGeoJson';

/**
 * Serializes features to an OpenLayers-compatible GeoJSON string.
 *
 * When `projection` differs from `"EPSG:4326"`, a `crs` annotation is added:
 * ```json
 * { "crs": { "type": "name", "properties": { "name": "EPSG:3857" } } }
 * ```
 * For EPSG:4326 no annotation is needed — it is the GeoJSON default.
 *
 * @param options - OpenLayers export options.
 * @returns `Result<string>` — valid JSON string or an error.
 *
 * @example
 * const result = exportToOpenLayers({ features, projection: 'EPSG:3857' });
 * if (result.success) vectorSource.addFeatures(new GeoJSON().readFeatures(JSON.parse(result.data)));
 */
export function exportToOpenLayers(options: OpenLayersExportOptions): Result<string> {
  const { features, projection = 'EPSG:4326', filter, pretty = false } = options;

  // Delegate to exportToGeoJson for the core FeatureCollection
  const geoResult = exportToGeoJson({ features, includeBbox: true, pretty, ...(filter !== undefined ? { filter } : {}) });
  if (!geoResult.success) return geoResult;

  // If projection is EPSG:4326 (the GeoJSON default), no CRS annotation needed
  if (projection === 'EPSG:4326') {
    return geoResult;
  }

  // Parse and add the CRS field
  const obj = JSON.parse(geoResult.data) as Record<string, unknown>;
  obj['crs'] = {
    type: 'name',
    properties: { name: projection },
  };

  return { success: true, data: JSON.stringify(obj, null, pretty ? 2 : 0) };
}
