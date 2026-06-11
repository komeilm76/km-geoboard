/**
 * GeoJSON TypeScript types — RFC 7946.
 *
 * This file contains ONLY type definitions — no Zod imports, no runtime code.
 * Zod schemas live in `schemas.ts`. This separation ensures declaration files
 * never carry a Zod import (see zod_hang.md).
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

/**
 * A GeoJSON position: [longitude, latitude] or [longitude, latitude, altitude].
 *
 * ⚠️  COORDINATE ORDER: longitude first, latitude second — NOT [lat, lng].
 * This is the reverse of what many mapping APIs (e.g. Google Maps) use.
 *
 * - Longitude: −180 to +180
 * - Latitude: −90 to +90
 * - Altitude: metres above WGS84 ellipsoid (optional)
 *
 * @example
 * const london: Position = [-0.1276, 51.5074]; // [lng, lat]
 */
export type Position = [number, number] | [number, number, number];

/**
 * A GeoJSON bounding box.
 *
 * 2D form: [west, south, east, north]
 * 3D form: [west, south, minAltitude, east, north, maxAltitude]
 *
 * West ≤ East and South ≤ North must hold.
 */
export type BoundingBox =
  | [number, number, number, number]
  | [number, number, number, number, number, number];

/**
 * A closed linear ring used in polygon geometry.
 *
 * Rules (RFC 7946):
 * - Minimum 4 positions.
 * - The first and last position must be identical (closed ring).
 * - The exterior ring is counter-clockwise; holes are clockwise.
 */
export type LinearRing = [Position, Position, Position, Position, ...Position[]];

// ─── Geometry Types ───────────────────────────────────────────────────────────

/**
 * GeoJSON Point geometry.
 * Represents a single geographic location.
 *
 * @example
 * const point: GeoJsonPoint = { type: "Point", coordinates: [-0.1276, 51.5074] };
 */
export type GeoJsonPoint = {
  type: 'Point';
  /** [longitude, latitude] or [longitude, latitude, altitude] */
  coordinates: Position;
  bbox?: BoundingBox;
};

/**
 * GeoJSON MultiPoint geometry.
 * Represents a collection of geographic locations.
 */
export type GeoJsonMultiPoint = {
  type: 'MultiPoint';
  /** Array of positions. Each is [longitude, latitude] or [longitude, latitude, altitude]. */
  coordinates: Position[];
  bbox?: BoundingBox;
};

/**
 * GeoJSON LineString geometry.
 * Represents a sequence of connected positions forming a line.
 * Requires at least 2 positions.
 */
export type GeoJsonLineString = {
  type: 'LineString';
  /** Minimum 2 positions required. Each is [longitude, latitude, ...]. */
  coordinates: [Position, Position, ...Position[]];
  bbox?: BoundingBox;
};

/**
 * GeoJSON MultiLineString geometry.
 * Represents multiple LineString geometries.
 */
export type GeoJsonMultiLineString = {
  type: 'MultiLineString';
  coordinates: [Position, Position, ...Position[]][];
  bbox?: BoundingBox;
};

/**
 * GeoJSON Polygon geometry.
 * Represents a closed area bounded by linear rings.
 * The first ring is the exterior boundary; any subsequent rings are holes.
 * Each ring must be closed (first === last position) and have at least 4 positions.
 */
export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: LinearRing[];
  bbox?: BoundingBox;
};

/**
 * GeoJSON MultiPolygon geometry.
 * Represents multiple Polygon geometries.
 */
export type GeoJsonMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: LinearRing[][];
  bbox?: BoundingBox;
};

/**
 * GeoJSON GeometryCollection.
 * A heterogeneous collection of other geometry objects.
 * The `geometries` array may be empty (valid per RFC 7946).
 *
 * Note: This type is recursive — `GeoJsonGeometry` includes `GeoJsonGeometryCollection`.
 */
export type GeoJsonGeometryCollection = {
  type: 'GeometryCollection';
  geometries: GeoJsonGeometry[];
  bbox?: BoundingBox;
};

/**
 * Union of all 7 GeoJSON geometry types.
 */
export type GeoJsonGeometry =
  | GeoJsonPoint
  | GeoJsonMultiPoint
  | GeoJsonLineString
  | GeoJsonMultiLineString
  | GeoJsonPolygon
  | GeoJsonMultiPolygon
  | GeoJsonGeometryCollection;

// ─── Feature Types ────────────────────────────────────────────────────────────

/**
 * GeoJSON Feature.
 * Associates a geometry with arbitrary properties.
 *
 * Per RFC 7946:
 * - `geometry` may be `null` (feature exists but has no geometry).
 * - `properties` may be `null`.
 * - `id` is optional and may be a string or number.
 *
 * @template G - The geometry type. Defaults to `GeoJsonGeometry | null`.
 * @template P - The properties type. Defaults to `Record<string, unknown> | null`.
 *
 * @example
 * const feature: GeoJsonFeature = {
 *   type: "Feature",
 *   geometry: { type: "Point", coordinates: [-0.1276, 51.5074] },
 *   properties: { name: "London" },
 * };
 */
export type GeoJsonFeature<
  G extends GeoJsonGeometry | null = GeoJsonGeometry,
  P extends Record<string, unknown> | null = Record<string, unknown>,
> = {
  type: 'Feature';
  /** The geometry for this feature, or null if the feature has no geometry. */
  geometry: G;
  /** Arbitrary key-value metadata, or null. */
  properties: P;
  /** Optional feature identifier. */
  id?: string | number;
  bbox?: BoundingBox;
};

/**
 * GeoJSON FeatureCollection.
 * A container for multiple Feature objects.
 *
 * @template G - The geometry type for each Feature.
 * @template P - The properties type for each Feature.
 *
 * @example
 * const collection: GeoJsonFeatureCollection = {
 *   type: "FeatureCollection",
 *   features: [],
 * };
 */
export type GeoJsonFeatureCollection<
  G extends GeoJsonGeometry | null = GeoJsonGeometry,
  P extends Record<string, unknown> | null = Record<string, unknown>,
> = {
  type: 'FeatureCollection';
  features: GeoJsonFeature<G, P>[];
  bbox?: BoundingBox;
};

/**
 * Root GeoJSON union — any valid top-level GeoJSON value.
 * A GeoJSON text is one of: a Geometry, a Feature, or a FeatureCollection.
 */
export type GeoJson = GeoJsonGeometry | GeoJsonFeature | GeoJsonFeatureCollection;
