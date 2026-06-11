/**
 * km-geojson — GeoJSON types, schemas, and utilities for RFC 7946.
 *
 * @packageDocumentation
 */

// Types
export type {
  Position,
  BoundingBox,
  LinearRing,
  GeoJsonPoint,
  GeoJsonMultiPoint,
  GeoJsonLineString,
  GeoJsonMultiLineString,
  GeoJsonPolygon,
  GeoJsonMultiPolygon,
  GeoJsonGeometryCollection,
  GeoJsonGeometry,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJson,
} from './types';

// Schemas
export {
  PositionSchema,
  BoundingBoxSchema,
  LinearRingSchema,
  GeoJsonPointSchema,
  GeoJsonMultiPointSchema,
  GeoJsonLineStringSchema,
  GeoJsonMultiLineStringSchema,
  GeoJsonPolygonSchema,
  GeoJsonMultiPolygonSchema,
  GeoJsonGeometryCollectionSchema,
  GeoJsonGeometrySchema,
  GeoJsonFeatureSchema,
  GeoJsonFeatureCollectionSchema,
  GeoJsonSchema,
} from './schemas';

// Parse functions
export {
  parseGeoJson,
  parseGeoJsonFeature,
  parseGeoJsonFeatureCollection,
} from './parse';

// Type guards
export { isGeoJsonGeometry } from './guards';

// Feature builders
export { featureFromGeometry, collectionFromFeatures } from './feature';

// Geometry utilities
export { getGeometryBoundingBox, flattenGeometryCollection } from './geometry';
