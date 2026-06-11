/**
 * TypeScript type guards for GeoJSON values.
 * These use Zod schema validation internally.
 */

import type { GeoJsonGeometry } from './types';
import { GeoJsonGeometrySchema } from './schemas';

/**
 * Type guard — returns `true` if `value` is a valid GeoJSON geometry object.
 *
 * Validates against all 7 geometry types using the Zod schema.
 * Does NOT match Feature or FeatureCollection — those are not geometry objects.
 *
 * @param value - Any unknown value to test.
 * @returns `true` if value is a `GeoJsonGeometry`, narrowing the type accordingly.
 *
 * @example
 * const value: unknown = { type: 'Point', coordinates: [0, 0] };
 * if (isGeoJsonGeometry(value)) {
 *   console.log(value.type); // "Point" — TypeScript knows the type here
 * }
 */
export function isGeoJsonGeometry(value: unknown): value is GeoJsonGeometry {
  return GeoJsonGeometrySchema.safeParse(value).success;
}
