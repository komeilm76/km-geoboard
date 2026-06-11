/**
 * importGeoJson — parse any GeoJSON value into a normalized GeoJsonFeatureCollection.
 */

import { GeoJsonSchema } from '@komeilm76/km-geojson';
import type { GeoJsonFeatureCollection, GeoJsonFeature, GeoJsonGeometry } from '@komeilm76/km-geojson';
import type { ImportResult, ImportWarning } from './types';

// The GeoJSON schema allows nullable properties at runtime even though the
// default GeoJsonFeature type uses Record<string,unknown> (not | null).
// We use this wider local type inside this module to correctly handle the
// null-properties normalization case.
type FeatureWithNullProps = GeoJsonFeature<GeoJsonGeometry | null, Record<string, unknown> | null>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeImportError(
  code: 'empty-input' | 'invalid-json' | 'schema-mismatch',
  message: string,
): ImportResult<GeoJsonFeatureCollection> {
  return { success: false, error: { code, message }, warnings: [] };
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize a single feature: null properties → {}, numeric id → string.
 * Emits warnings for each normalization applied.
 */
function normalizeFeature(
  feature: FeatureWithNullProps,
  warnings: ImportWarning[],
): GeoJsonFeature {
  let properties: Record<string, unknown> | null = feature.properties;
  let id = feature.id;

  if (properties === null) {
    warnings.push({
      code: 'properties-normalized',
      message: 'Feature.properties was null — normalized to {}',
      context: String(feature.id ?? 'unknown'),
    });
    properties = {};
  }

  if (typeof id === 'number') {
    warnings.push({
      code: 'id-normalized',
      message: `Feature.id was numeric (${id}) — normalized to string`,
      context: String(id),
    });
    id = String(id);
  }

  return { ...feature, properties: properties as Record<string, unknown>, id } as GeoJsonFeature;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses any valid GeoJSON value and normalizes it into a FeatureCollection.
 *
 * - FeatureCollection → returned as-is (features normalized).
 * - Feature → wrapped in a FeatureCollection.
 * - Any Geometry → wrapped in a Feature (empty properties), then a FeatureCollection.
 *
 * Normalization applied:
 * - `Feature.properties = null` → `{}` (warning emitted)
 * - Numeric `Feature.id` → string (warning emitted)
 *
 * @param raw - A JSON string or a plain object.
 * @returns ImportResult<GeoJsonFeatureCollection>
 */
export function importGeoJson(raw: string | unknown): ImportResult<GeoJsonFeatureCollection> {
  // 1. Guard: empty input
  if (raw === null || raw === undefined || raw === '') {
    return makeImportError('empty-input', 'Input is null, undefined, or empty string');
  }

  // 2. Parse JSON string
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return makeImportError('invalid-json', 'Failed to parse JSON string');
    }
  }

  // 3. Validate against GeoJSON schema
  const parsed = GeoJsonSchema.safeParse(value);
  if (!parsed.success) {
    return makeImportError('schema-mismatch', 'Input is not valid GeoJSON');
  }

  const geojson = parsed.data;
  const warnings: ImportWarning[] = [];

  // 4. Normalize to FeatureCollection
  let collection: GeoJsonFeatureCollection;

  if (geojson.type === 'FeatureCollection') {
    const normalizedFeatures = geojson.features.map((f) =>
      normalizeFeature(f as FeatureWithNullProps, warnings),
    );
    collection = { ...geojson, features: normalizedFeatures } as GeoJsonFeatureCollection;
  } else if (geojson.type === 'Feature') {
    const normalizedFeature = normalizeFeature(geojson as FeatureWithNullProps, warnings);
    collection = {
      type: 'FeatureCollection',
      features: [normalizedFeature],
    } as GeoJsonFeatureCollection;
  } else {
    // Geometry type — wrap in Feature (empty properties), then FeatureCollection
    const feature: GeoJsonFeature = {
      type: 'Feature',
      geometry: geojson as GeoJsonGeometry,
      properties: {},
    };
    collection = {
      type: 'FeatureCollection',
      features: [feature],
    } as GeoJsonFeatureCollection;
  }

  return { success: true, data: collection, warnings };
}
