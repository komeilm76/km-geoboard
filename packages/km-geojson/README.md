# @komeilm76/km-geojson

GeoJSON types and validation for [RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946) — parse, validate, construct, and query GeoJSON data with full TypeScript inference and Zod runtime schemas.

No rendering, no map engine — just types and pure functions. Works in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-geojson zod
# or
pnpm add @komeilm76/km-geojson zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import {
  parseGeoJson,
  featureFromGeometry,
  collectionFromFeatures,
  getGeometryBoundingBox,
} from '@komeilm76/km-geojson';
import type { GeoJsonFeature, GeoJsonPoint } from '@komeilm76/km-geojson';

// Validate untrusted input (returns Result — never throws)
const result = parseGeoJson(JSON.parse(rawString));
if (result.success) {
  console.log(result.data.type); // 'Feature' | 'FeatureCollection' | geometry type
} else {
  console.error(result.error.code, result.error.message);
}

// Build features programmatically
const point: GeoJsonPoint = { type: 'Point', coordinates: [-0.1276, 51.5074] };
const feature = featureFromGeometry(point, { name: 'London' });
const collection = collectionFromFeatures([feature]);

// Query geometry
const bbox = getGeometryBoundingBox(point);
// → [-0.1276, 51.5074, -0.1276, 51.5074]  (west, south, east, north)
```

## API

### Parse functions (all return `Result<T>`, never throw)

| Function | Validates | Returns |
|---|---|---|
| `parseGeoJson(raw: unknown)` | Any top-level GeoJSON value | `Result<GeoJson>` |
| `parseGeoJsonFeature(raw: unknown)` | A single Feature | `Result<GeoJsonFeature>` |
| `parseGeoJsonFeatureCollection(raw: unknown)` | A FeatureCollection | `Result<GeoJsonFeatureCollection>` |

On failure, `error.code` is kebab-case (e.g. `'schema-mismatch'`) and `error.message` explains what's wrong.

### Type guards

```ts
import { isGeoJsonGeometry } from '@komeilm76/km-geojson';

if (isGeoJsonGeometry(value)) {
  // value is narrowed to GeoJsonGeometry
}
```

### Feature builders

| Function | Description |
|---|---|
| `featureFromGeometry(geometry, properties?)` | Wrap a geometry into a `Feature` |
| `collectionFromFeatures(features)` | Wrap features into a `FeatureCollection` |

### Geometry utilities

| Function | Description |
|---|---|
| `getGeometryBoundingBox(geometry)` | Compute `[west, south, east, north]` for any geometry |
| `flattenGeometryCollection(collection)` | Flatten nested `GeometryCollection`s into a flat geometry array |

## Types

All RFC 7946 types are exported, fully generic where it matters:

| Type | Shape |
|---|---|
| `Position` | `[lng, lat]` or `[lng, lat, alt]` |
| `BoundingBox` | `[west, south, east, north]` (or 3D 6-tuple) |
| `LinearRing` | Closed ring of positions (first = last) |
| `GeoJsonPoint`, `GeoJsonMultiPoint`, `GeoJsonLineString`, `GeoJsonMultiLineString`, `GeoJsonPolygon`, `GeoJsonMultiPolygon` | The 6 concrete geometries |
| `GeoJsonGeometryCollection` | `{ type: 'GeometryCollection', geometries: [...] }` |
| `GeoJsonGeometry` | Union of all 7 geometry types |
| `GeoJsonFeature<G, P>` | Generic over geometry and properties — both nullable per RFC 7946 |
| `GeoJsonFeatureCollection<G, P>` | Generic collection |
| `GeoJson` | Top-level union: geometry, feature, or collection |

Example of the generics:

```ts
import type { GeoJsonFeature, GeoJsonPolygon } from '@komeilm76/km-geojson';

// A feature that is guaranteed to hold a Polygon with typed properties
type ZoneFeature = GeoJsonFeature<GeoJsonPolygon, { zoneId: string; level: number }>;
```

### Zod schemas

Every type has a matching runtime schema: `PositionSchema`, `BoundingBoxSchema`, `LinearRingSchema`, `GeoJsonPointSchema`, `GeoJsonMultiPointSchema`, `GeoJsonLineStringSchema`, `GeoJsonMultiLineStringSchema`, `GeoJsonPolygonSchema`, `GeoJsonMultiPolygonSchema`, `GeoJsonGeometryCollectionSchema`, `GeoJsonGeometrySchema`, `GeoJsonFeatureSchema`, `GeoJsonFeatureCollectionSchema`, `GeoJsonSchema`.

```ts
import { GeoJsonFeatureCollectionSchema } from '@komeilm76/km-geojson';

const checked = GeoJsonFeatureCollectionSchema.safeParse(payload);
```

Schemas use structural types in the public signatures, so this package's declaration files never import Zod (IDE-safe — see the repo's `zod_hang.md`).

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `geojson` namespace |
| [`@komeilm76/km-svg`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-svg) | Convert SVG shapes into these GeoJSON types |
| [`@komeilm76/km-map`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-map) | Geographic math over these types (area, bounds, tiles) |
| [`@komeilm76/km-imports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-imports) / [`km-exports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-exports) | Import/export pipelines built on these types |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-geojson/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
