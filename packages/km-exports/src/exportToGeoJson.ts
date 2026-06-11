/**
 * @file exportToGeoJson.ts
 * Serializes GeoJSON features into a FeatureCollection string.
 */

import type { Result, GeoJsonExportOptions, GeoJsonFeatureCollection } from './types';
import { applyExportFilter, getGeometryBoundingBox } from './filter';

/**
 * Serializes an array of {@link GeoJsonFeature} objects into a GeoJSON
 * `FeatureCollection` string.
 *
 * @param options - GeoJSON export options.
 * @returns `Result<string>` — valid JSON string or an error.
 *
 * @example
 * const result = exportToGeoJson({ features, includeBbox: true, pretty: true });
 * if (result.success) fs.writeFileSync('data.geojson', result.data);
 */
export function exportToGeoJson(options: GeoJsonExportOptions): Result<string> {
  const { features, filter, includeBbox = true, pretty = false } = options;

  // Apply filter
  const filtered = applyExportFilter(features, filter);
  if (filtered.length === 0) {
    return {
      success: false,
      error: { code: 'empty-export', message: 'No features remain after applying the export filter.' },
    };
  }

  // Build FeatureCollection object
  const collection: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: filtered,
  };

  // Compute root bbox
  if (includeBbox) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasAny = false;

    for (const feature of filtered) {
      if (feature.geometry === null) continue;
      const bbox = getGeometryBoundingBox(feature.geometry);
      if (bbox === null) continue;
      hasAny = true;
      if (bbox[0] < minX) minX = bbox[0];
      if (bbox[1] < minY) minY = bbox[1];
      if (bbox[2] > maxX) maxX = bbox[2];
      if (bbox[3] > maxY) maxY = bbox[3];
    }

    if (hasAny) {
      collection.bbox = [minX, minY, maxX, maxY];
    }
    // If all features have null geometry, omit bbox entirely (nothing to compute).
  }

  const jsonString = JSON.stringify(collection, null, pretty ? 2 : 0);
  return { success: true, data: jsonString };
}
