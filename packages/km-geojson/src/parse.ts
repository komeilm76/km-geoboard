/**
 * GeoJSON parse functions.
 * All functions return Result<T> and never throw.
 */

import type { Result } from 'km-shared';
import type {
  GeoJson,
  GeoJsonGeometry,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
} from './types';
import {
  GeoJsonSchema,
  GeoJsonFeatureSchema,
  GeoJsonFeatureCollectionSchema,
} from './schemas';

type AnyFeature = GeoJsonFeature<GeoJsonGeometry | null, Record<string, unknown> | null>;
type AnyCollection = GeoJsonFeatureCollection<GeoJsonGeometry | null, Record<string, unknown> | null>;

/**
 * Validates and parses any top-level GeoJSON value.
 *
 * @param raw - Unknown value to validate.
 * @returns Result<GeoJson> on success, or failure with code "invalid-input".
 *
 * @example
 * const r = parseGeoJson({ type: 'Point', coordinates: [-0.1276, 51.5074] });
 * if (r.success) console.log(r.data.type); // "Point"
 */
export function parseGeoJson(raw: unknown): Result<GeoJson> {
  const parsed = GeoJsonSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { code: 'invalid-input', message: (parsed.error.issues[0]?.message ?? 'Invalid GeoJSON') } };
  }
  return { success: true, data: parsed.data as GeoJson };
}

/**
 * Validates and parses a GeoJSON Feature.
 * Allows null geometry and null properties per RFC 7946.
 *
 * @param raw - Unknown value to validate.
 * @returns Result with typed Feature, or failure with code "invalid-input".
 *
 * @example
 * const r = parseGeoJsonFeature({ type: 'Feature', geometry: null, properties: null });
 * if (r.success) console.log(r.data.type); // "Feature"
 */
export function parseGeoJsonFeature(raw: unknown): Result<AnyFeature> {
  const parsed = GeoJsonFeatureSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { code: 'invalid-input', message: (parsed.error.issues[0]?.message ?? 'Invalid GeoJSON') } };
  }
  return { success: true, data: parsed.data as unknown as AnyFeature };
}

/**
 * Validates and parses a GeoJSON FeatureCollection.
 *
 * @param raw - Unknown value to validate.
 * @returns Result with typed FeatureCollection, or failure with code "invalid-input".
 *
 * @example
 * const r = parseGeoJsonFeatureCollection({ type: 'FeatureCollection', features: [] });
 * if (r.success) console.log(r.data.features.length); // 0
 */
export function parseGeoJsonFeatureCollection(raw: unknown): Result<AnyCollection> {
  const parsed = GeoJsonFeatureCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { code: 'invalid-input', message: (parsed.error.issues[0]?.message ?? 'Invalid GeoJSON') } };
  }
  return { success: true, data: parsed.data as unknown as AnyCollection };
}
