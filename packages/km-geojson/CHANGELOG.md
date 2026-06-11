# Changelog

## [0.1.0] — 2026-06-11

### Added

**Types (`src/types.ts`)**
- `Position` — 2-element or 3-element coordinate tuple (longitude first)
- `BoundingBox` — 4-element or 6-element bounding box tuple
- `LinearRing` — closed ring with minimum 4 positions
- `GeoJsonPoint` — Point geometry
- `GeoJsonMultiPoint` — MultiPoint geometry
- `GeoJsonLineString` — LineString geometry (minimum 2 positions)
- `GeoJsonMultiLineString` — MultiLineString geometry
- `GeoJsonPolygon` — Polygon geometry with LinearRing array
- `GeoJsonMultiPolygon` — MultiPolygon geometry
- `GeoJsonGeometryCollection` — recursive geometry collection
- `GeoJsonGeometry` — union of all 7 geometry types
- `GeoJsonFeature<G, P>` — Feature with generic geometry and properties
- `GeoJsonFeatureCollection<G, P>` — FeatureCollection with generics
- `GeoJson` — root union type

**Schemas (`src/schemas.ts`)**
- `PositionSchema` — validates 2-tuple and 3-tuple coordinate positions
- `BoundingBoxSchema` — validates 4/6-tuple with west ≤ east and south ≤ north
- `LinearRingSchema` — validates minimum 4 positions and ring closure (first === last)
- `GeoJsonPointSchema`
- `GeoJsonMultiPointSchema`
- `GeoJsonLineStringSchema` — validates minimum 2 positions
- `GeoJsonMultiLineStringSchema`
- `GeoJsonPolygonSchema` — validates array of LinearRings (min 1)
- `GeoJsonMultiPolygonSchema`
- `GeoJsonGeometryCollectionSchema`
- `GeoJsonGeometrySchema` — lazy recursive discriminated union
- `GeoJsonFeatureSchema` — nullable geometry and properties
- `GeoJsonFeatureCollectionSchema`
- `GeoJsonSchema` — root union schema

**Functions (`src/parse.ts`)**
- `parseGeoJson(raw)` — validates and parses any GeoJSON value
- `parseGeoJsonFeature(raw)` — validates and parses a Feature
- `parseGeoJsonFeatureCollection(raw)` — validates and parses a FeatureCollection

**Functions (`src/guards.ts`)**
- `isGeoJsonGeometry(value)` — TypeScript type guard for geometry objects

**Functions (`src/feature.ts`)**
- `featureFromGeometry(geometry, properties?, id?)` — wraps geometry in a Feature
- `collectionFromFeatures(features)` — wraps array in a FeatureCollection

**Functions (`src/geometry.ts`)**
- `getGeometryBoundingBox(geometry)` — computes [west, south, east, north] bounding box
- `flattenGeometryCollection(geometry)` — recursively flattens GeometryCollections
