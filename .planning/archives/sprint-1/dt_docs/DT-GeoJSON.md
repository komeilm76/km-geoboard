# DT-GeoJSON

> Complete GeoJSON type definitions and Zod schemas — all types from RFC 7946.

---

## Overview

This package implements the full **GeoJSON specification (RFC 7946)** as TypeScript types and Zod v4 schemas.  
Every geometry type, feature type, and collection type is covered.  
All schemas use `safeParse` and integrate with the project's `Result<T>` pattern.

GeoJSON is the primary interchange format for geographic data in this project.  
SVG content, artboard regions, and map layers are all convertible to and from GeoJSON.

---

## Coordinate System

GeoJSON uses **geographic coordinates** (longitude, latitude, optional altitude):

- Position: `[longitude, latitude]` or `[longitude, latitude, altitude]`
- Longitude: −180 to +180
- Latitude: −90 to +90
- Altitude: meters above/below WGS84 ellipsoid (optional)

**Note:** GeoJSON uses `[longitude, latitude]` order — **longitude first**, latitude second.  
This is the reverse of what many humans expect ("lat, lng").

---

## Types

### `Position`

```ts
/** [longitude, latitude] or [longitude, latitude, altitude] */
type Position = [number, number] | [number, number, number];
```

### `BoundingBox`

```ts
/** [west, south, east, north] or [west, south, minAlt, east, north, maxAlt] */
type BoundingBox =
  | [number, number, number, number]
  | [number, number, number, number, number, number];
```

---

## Geometry Types

### `Point`

```ts
type GeoJsonPoint = {
  type: "Point";
  coordinates: Position;
  bbox?: BoundingBox;
};
```

### `MultiPoint`

```ts
type GeoJsonMultiPoint = {
  type: "MultiPoint";
  coordinates: Position[];
  bbox?: BoundingBox;
};
```

### `LineString`

```ts
/** Minimum 2 positions required. */
type GeoJsonLineString = {
  type: "LineString";
  coordinates: [Position, Position, ...Position[]];
  bbox?: BoundingBox;
};
```

### `MultiLineString`

```ts
type GeoJsonMultiLineString = {
  type: "MultiLineString";
  coordinates: [Position, Position, ...Position[][]];
  bbox?: BoundingBox;
};
```

### `Polygon`

```ts
/**
 * An array of linear rings.
 * The first ring is the exterior; subsequent rings are holes.
 * Each ring must have at least 4 positions and the first and last must be identical (closed).
 */
type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: LinearRing[];
  bbox?: BoundingBox;
};

/** A closed linear ring — minimum 4 positions, first === last. */
type LinearRing = [Position, Position, Position, Position, ...Position[]];
```

### `MultiPolygon`

```ts
type GeoJsonMultiPolygon = {
  type: "MultiPolygon";
  coordinates: LinearRing[][];
  bbox?: BoundingBox;
};
```

### `GeometryCollection`

```ts
type GeoJsonGeometryCollection = {
  type: "GeometryCollection";
  geometries: GeoJsonGeometry[];
  bbox?: BoundingBox;
};
```

### `GeoJsonGeometry` (union)

```ts
type GeoJsonGeometry =
  | GeoJsonPoint
  | GeoJsonMultiPoint
  | GeoJsonLineString
  | GeoJsonMultiLineString
  | GeoJsonPolygon
  | GeoJsonMultiPolygon
  | GeoJsonGeometryCollection;
```

---

## Feature Types

### `GeoJsonFeature`

```ts
type GeoJsonFeature<
  G extends GeoJsonGeometry | null = GeoJsonGeometry,
  P extends Record<string, unknown> | null = Record<string, unknown>
> = {
  type: "Feature";
  geometry: G;
  properties: P;
  id?: string | number;
  bbox?: BoundingBox;
};
```

### `GeoJsonFeatureCollection`

```ts
type GeoJsonFeatureCollection<
  G extends GeoJsonGeometry | null = GeoJsonGeometry,
  P extends Record<string, unknown> | null = Record<string, unknown>
> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<G, P>[];
  bbox?: BoundingBox;
};
```

### `GeoJson` (root union)

```ts
type GeoJson =
  | GeoJsonGeometry
  | GeoJsonFeature
  | GeoJsonFeatureCollection;
```

---

## Zod Schemas

All schemas are in `packages/km-geojson/src/schemas.ts`.

Key schemas:

```ts
const PositionSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number()]),
]);

const GeoJsonPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: PositionSchema,
  bbox: BoundingBoxSchema.optional(),
});

const GeoJsonPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(LinearRingSchema).min(1),
  bbox: BoundingBoxSchema.optional(),
});

// Lazy reference to handle GeometryCollection's recursive geometry array
const GeoJsonGeometrySchema: z.ZodType<GeoJsonGeometry> = z.lazy(() =>
  z.discriminatedUnion("type", [
    GeoJsonPointSchema,
    GeoJsonMultiPointSchema,
    GeoJsonLineStringSchema,
    GeoJsonMultiLineStringSchema,
    GeoJsonPolygonSchema,
    GeoJsonMultiPolygonSchema,
    GeoJsonGeometryCollectionSchema,
  ])
);

const GeoJsonFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: GeoJsonGeometrySchema.nullable(),
  properties: z.record(z.string(), z.unknown()).nullable(),
  id: z.union([z.string(), z.number()]).optional(),
  bbox: BoundingBoxSchema.optional(),
});

const GeoJsonFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(GeoJsonFeatureSchema),
  bbox: BoundingBoxSchema.optional(),
});
```

---

## Functions

### `parseGeoJson`

Validates and parses any GeoJSON value.

```ts
function parseGeoJson(raw: unknown): Result<GeoJson>
```

### `parseGeoJsonFeature`

Validates and parses a single GeoJSON Feature.

```ts
function parseGeoJsonFeature(raw: unknown): Result<GeoJsonFeature>
```

### `parseGeoJsonFeatureCollection`

Validates and parses a FeatureCollection.

```ts
function parseGeoJsonFeatureCollection(raw: unknown): Result<GeoJsonFeatureCollection>
```

### `isGeoJsonGeometry`

Type guard — returns `true` if the value is a valid GeoJSON geometry.

```ts
function isGeoJsonGeometry(value: unknown): value is GeoJsonGeometry
```

### `getGeometryBoundingBox`

Computes the bounding box `[west, south, east, north]` for any geometry.

```ts
function getGeometryBoundingBox(geometry: GeoJsonGeometry): [number, number, number, number]
```

### `featureFromGeometry`

Wraps a geometry in a Feature with optional properties.

```ts
function featureFromGeometry(
  geometry: GeoJsonGeometry,
  properties?: Record<string, unknown>,
  id?: string | number
): GeoJsonFeature
```

### `collectionFromFeatures`

Wraps an array of Features in a FeatureCollection.

```ts
function collectionFromFeatures(features: GeoJsonFeature[]): GeoJsonFeatureCollection
```

### `flattenGeometryCollection`

Recursively flattens a `GeometryCollection` into an array of non-collection geometries.

```ts
function flattenGeometryCollection(geometry: GeoJsonGeometry): Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>[]
```

---

## Validation Rules

The schemas enforce the following RFC 7946 constraints:

- `LineString` must have at least 2 positions.
- `LinearRing` (polygon ring) must have at least 4 positions and must be **closed** (first position === last position).
- `Polygon` must have at least 1 ring.
- `GeometryCollection` may have an empty `geometries` array (valid per spec).
- `Feature.geometry` may be `null` (valid per spec — represents a feature with no geometry).
- `Feature.properties` may be `null` (valid per spec).
- `BoundingBox` values must satisfy west ≤ east and south ≤ north.

---

## Error Codes

| Code | Description |
|---|---|
| `invalid-input` | The raw value does not match any GeoJSON schema |
| `invalid-geometry-type` | The `type` field is not a known geometry type |
| `ring-not-closed` | A polygon ring's first and last positions are not equal |
| `ring-too-short` | A polygon ring has fewer than 4 positions |
| `linestring-too-short` | A LineString has fewer than 2 positions |

---

## File Location

```
packages/
  geojson/
    src/
      types.ts        ← All GeoJSON TypeScript types
      schemas.ts      ← All Zod schemas
      parse.ts        ← parseGeoJson, parseGeoJsonFeature, etc.
      geometry.ts     ← getGeometryBoundingBox, flattenGeometryCollection
      feature.ts      ← featureFromGeometry, collectionFromFeatures
      guards.ts       ← isGeoJsonGeometry and other type guards
      index.ts        ← Public re-exports
    tests/
      schemas.test.ts
      parse.test.ts
      geometry.test.ts
    help.md
```
