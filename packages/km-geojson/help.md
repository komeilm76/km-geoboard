# km-geojson — API Reference

> GeoJSON types and validation for RFC 7946.  
> Parse, validate, and construct GeoJSON data in any environment.

---

## Overview

`km-geojson` implements the full GeoJSON specification (RFC 7946) as TypeScript types and Zod v4 schemas. Use this package to parse, validate, and construct GeoJSON data — geometries, features, and feature collections — with full runtime validation and type safety.

---

## Installation

```bash
npm install @komeilm76/km-geojson zod
```

Zod must be installed separately — it is a peer dependency.

---

## Coordinate System

> ⚠️  **Longitude first.** GeoJSON uses `[longitude, latitude]` order — the **reverse** of what many mapping APIs use.

| Field | Range | Note |
|---|---|---|
| Longitude | −180 to +180 | **First** element of Position |
| Latitude | −90 to +90 | Second element |
| Altitude | any number | Optional third element (metres, WGS84) |

```ts
// Correct: [longitude, latitude]
const london: Position = [-0.1276, 51.5074];

// Wrong: [latitude, longitude] — common mistake
const wrong: Position = [51.5074, -0.1276]; // ❌
```

---

## Functions

### `parseGeoJson`

Validates and parses any top-level GeoJSON value.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `unknown` | Any value to validate |

**Returns:** `Result<GeoJson>` — success with typed data, or failure with `code: "invalid-input"`.

```ts
import { parseGeoJson } from '@komeilm76/km-geojson';

const result = parseGeoJson({ type: 'Point', coordinates: [-0.1276, 51.5074] });
if (result.success) {
  console.log(result.data.type); // "Point"
} else {
  console.error(result.error.code); // "invalid-input"
}
```

---

### `parseGeoJsonFeature`

Validates and parses a GeoJSON Feature. Allows `null` geometry and `null` properties per RFC 7946.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `unknown` | Any value to validate |

**Returns:** `Result<GeoJsonFeature<GeoJsonGeometry | null, ...>>` — success or failure with `code: "invalid-input"`.

```ts
import { parseGeoJsonFeature } from '@komeilm76/km-geojson';

const result = parseGeoJsonFeature({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: { name: 'Origin' },
});
if (result.success) {
  console.log(result.data.properties); // { name: 'Origin' }
}
```

---

### `parseGeoJsonFeatureCollection`

Validates and parses a GeoJSON FeatureCollection.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `unknown` | Any value to validate |

**Returns:** `Result<GeoJsonFeatureCollection<...>>` — success or failure with `code: "invalid-input"`.

```ts
import { parseGeoJsonFeatureCollection } from '@komeilm76/km-geojson';

const result = parseGeoJsonFeatureCollection({
  type: 'FeatureCollection',
  features: [],
});
if (result.success) {
  console.log(result.data.features.length); // 0
}
```

---

### `isGeoJsonGeometry`

Type guard — returns `true` if the value is a valid GeoJSON geometry object.

Does **not** match `Feature` or `FeatureCollection` — those are not geometry objects.

| Parameter | Type | Description |
|---|---|---|
| `value` | `unknown` | Any value to test |

**Returns:** `value is GeoJsonGeometry` (boolean type guard).

```ts
import { isGeoJsonGeometry } from '@komeilm76/km-geojson';

const value: unknown = { type: 'Point', coordinates: [0, 0] };
if (isGeoJsonGeometry(value)) {
  console.log(value.type); // TypeScript knows the type here: GeoJsonGeometry
}

isGeoJsonGeometry({ type: 'Feature', geometry: null, properties: null }); // false
```

---

### `getGeometryBoundingBox`

Computes the bounding box `[west, south, east, north]` for any GeoJSON geometry.

Handles all 7 geometry types including nested `GeometryCollection` (recursive).

| Parameter | Type | Description |
|---|---|---|
| `geometry` | `GeoJsonGeometry` | Any geometry object |

**Returns:** `[number, number, number, number]` — `[west, south, east, north]`.

```ts
import { getGeometryBoundingBox } from '@komeilm76/km-geojson';

const bbox = getGeometryBoundingBox({
  type: 'LineString',
  coordinates: [[-10, -5], [10, 5]],
});
console.log(bbox); // [-10, -5, 10, 5]
```

---

### `flattenGeometryCollection`

Recursively flattens a `GeometryCollection` into an array of non-collection geometries.

If the input is not a `GeometryCollection`, it is returned in a single-element array.

| Parameter | Type | Description |
|---|---|---|
| `geometry` | `GeoJsonGeometry` | Any geometry (collection or primitive) |

**Returns:** `Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>[]` — flat array of primitive geometries.

```ts
import { flattenGeometryCollection } from '@komeilm76/km-geojson';

const flat = flattenGeometryCollection({
  type: 'GeometryCollection',
  geometries: [
    { type: 'Point', coordinates: [0, 0] },
    {
      type: 'GeometryCollection',
      geometries: [{ type: 'Point', coordinates: [1, 1] }],
    },
  ],
});
// [{ type: 'Point', coordinates: [0, 0] }, { type: 'Point', coordinates: [1, 1] }]
```

---

### `featureFromGeometry`

Wraps a geometry in a GeoJSON Feature with optional properties and id.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `geometry` | `GeoJsonGeometry` | — | The geometry to wrap |
| `properties` | `Record<string, unknown>` | `{}` | Key-value metadata |
| `id` | `string \| number` | omitted | Optional feature identifier |

**Returns:** `GeoJsonFeature`.

```ts
import { featureFromGeometry } from '@komeilm76/km-geojson';

const feature = featureFromGeometry(
  { type: 'Point', coordinates: [-0.1276, 51.5074] },
  { name: 'London' },
  'london-1',
);
// { type: 'Feature', geometry: ..., properties: { name: 'London' }, id: 'london-1' }
```

---

### `collectionFromFeatures`

Wraps an array of Features in a FeatureCollection.

| Parameter | Type | Description |
|---|---|---|
| `features` | `GeoJsonFeature[]` | Array of Feature objects |

**Returns:** `GeoJsonFeatureCollection`.

```ts
import { collectionFromFeatures, featureFromGeometry } from '@komeilm76/km-geojson';

const f1 = featureFromGeometry({ type: 'Point', coordinates: [0, 0] });
const f2 = featureFromGeometry({ type: 'Point', coordinates: [1, 1] });
const collection = collectionFromFeatures([f1, f2]);
// { type: 'FeatureCollection', features: [f1, f2] }
```

---

## Types

### `Position`

```ts
type Position = [number, number] | [number, number, number];
// [longitude, latitude] or [longitude, latitude, altitude]
```

⚠️  Longitude is always first.

---

### `BoundingBox`

```ts
type BoundingBox =
  | [number, number, number, number]           // [west, south, east, north]
  | [number, number, number, number, number, number]; // [west, south, minAlt, east, north, maxAlt]
```

---

### `LinearRing`

```ts
type LinearRing = [Position, Position, Position, Position, ...Position[]];
// Minimum 4 positions. First position must equal last (closed ring).
```

---

### `GeoJsonPoint`

| Field | Type | Required |
|---|---|---|
| `type` | `"Point"` | Yes |
| `coordinates` | `Position` | Yes |
| `bbox` | `BoundingBox` | No |

---

### `GeoJsonPolygon`

| Field | Type | Required |
|---|---|---|
| `type` | `"Polygon"` | Yes |
| `coordinates` | `LinearRing[]` | Yes |
| `bbox` | `BoundingBox` | No |

The first ring is the exterior boundary; subsequent rings are holes.

---

### `GeoJsonFeature<G, P>`

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"Feature"` | Yes | |
| `geometry` | `G \| null` | Yes | `null` is valid per RFC 7946 |
| `properties` | `P \| null` | Yes | `null` is valid per RFC 7946 |
| `id` | `string \| number` | No | |
| `bbox` | `BoundingBox` | No | |

---

### `GeoJsonFeatureCollection<G, P>`

| Field | Type | Required |
|---|---|---|
| `type` | `"FeatureCollection"` | Yes |
| `features` | `GeoJsonFeature<G, P>[]` | Yes |
| `bbox` | `BoundingBox` | No |

---

## Errors

All parse functions return `Result<T>` — they never throw. On failure, the `error` object contains:

| Field | Type | Description |
|---|---|---|
| `code` | `string` | Machine-readable error code |
| `message` | `string` | Human-readable description |

### Error Codes

| Code | Description |
|---|---|
| `invalid-input` | The raw value does not match any GeoJSON schema |
| `invalid-geometry-type` | The `type` field is not a known geometry type |
| `ring-not-closed` | A polygon ring's first and last positions are not equal |
| `ring-too-short` | A polygon ring has fewer than 4 positions |
| `linestring-too-short` | A LineString has fewer than 2 positions |

The codes `ring-not-closed`, `ring-too-short`, and `linestring-too-short` appear in the error `message` string when parsing fails due to RFC 7946 constraint violations.

---

## Schemas

All Zod schemas are exported for consumers who need direct validation:

```ts
import {
  PositionSchema,
  LinearRingSchema,
  GeoJsonPointSchema,
  GeoJsonGeometrySchema,
  GeoJsonFeatureSchema,
  GeoJsonFeatureCollectionSchema,
  GeoJsonSchema,
} from '@komeilm76/km-geojson';

const result = GeoJsonSchema.safeParse(unknownData);
```
