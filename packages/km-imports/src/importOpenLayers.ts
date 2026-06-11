/**
 * importOpenLayers — parse an OpenLayers vector source JSON into a GeoJsonFeatureCollection.
 *
 * OpenLayers may add a top-level `crs` field and other metadata to its exported GeoJSON.
 * This function strips those fields and delegates to importGeoJson.
 */

import type { GeoJsonFeatureCollection } from 'km-geojson';
import type { ImportResult, ImportWarning } from './types';
import { importGeoJson } from './importGeoJson';

// Fields added by OpenLayers at the root level that are not valid GeoJSON.
const OL_METADATA_FIELDS = ['crs', 'name', 'srsName'];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses an OpenLayers vector source JSON string or object.
 *
 * Strips the top-level `crs` field (and other OpenLayers metadata) before
 * delegating to `importGeoJson`. If `crs` is present and is not `"EPSG:4326"`,
 * an `ImportWarning` is emitted.
 *
 * @param raw - JSON string or plain object from an OpenLayers source.
 * @returns ImportResult<GeoJsonFeatureCollection>
 */
export function importOpenLayers(raw: string | unknown): ImportResult<GeoJsonFeatureCollection> {
  // 1. Guard: empty input (delegate to importGeoJson for consistent error)
  if (raw === null || raw === undefined || raw === '') {
    return importGeoJson(raw);
  }

  // 2. Parse JSON string to object if necessary
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      // Let importGeoJson handle the invalid-json error path
      return importGeoJson(raw);
    }
  }

  const crsWarnings: ImportWarning[] = [];

  // 3. Strip OpenLayers metadata from a copy of the object
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;

    // Handle the crs field — warn if non-EPSG:4326
    if ('crs' in obj) {
      const crs = obj['crs'];
      const crsId = extractCrsId(crs);

      if (crsId !== null && crsId !== 'EPSG:4326') {
        crsWarnings.push({
          code: 'crs-stripped',
          message: `CRS '${crsId}' stripped; output is EPSG:4326`,
          context: crsId,
        });
      }
    }

    // Remove all OL-specific metadata fields
    const cleaned: Record<string, unknown> = { ...obj };
    for (const field of OL_METADATA_FIELDS) {
      delete cleaned[field];
    }
    value = cleaned;
  }

  // 4. Delegate to importGeoJson
  const result = importGeoJson(value);

  // 5. Merge crs warnings with any warnings from importGeoJson
  return {
    ...result,
    warnings: [...crsWarnings, ...result.warnings],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a CRS identifier string from various OpenLayers crs representations.
 *
 * OpenLayers exports crs in several forms:
 * - string: "EPSG:4326"
 * - OGC object: { type: "name", properties: { name: "EPSG:3857" } }
 *
 * Returns null if the crs is in an unrecognized format.
 */
function extractCrsId(crs: unknown): string | null {
  if (typeof crs === 'string') return crs;
  if (crs !== null && typeof crs === 'object') {
    const obj = crs as Record<string, unknown>;
    // OGC named CRS: { type: "name", properties: { name: "EPSG:4326" } }
    if (obj['type'] === 'name' && obj['properties'] !== null && typeof obj['properties'] === 'object') {
      const name = (obj['properties'] as Record<string, unknown>)['name'];
      if (typeof name === 'string') return name;
    }
    // EPSG code directly: { properties: { name: "urn:ogc:def:crs:EPSG::4326" } }
    if (typeof obj['name'] === 'string') return obj['name'];
  }
  return null;
}
