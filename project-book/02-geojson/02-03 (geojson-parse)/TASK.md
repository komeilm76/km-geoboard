# Page 02-03 — GeoJSON Parse and Utility Functions

## Summary
Implements all GeoJSON utility functions: `parseGeoJson`, `parseGeoJsonFeature`,
`parseGeoJsonFeatureCollection`, `isGeoJsonGeometry` (type guard), `getGeometryBoundingBox`,
`featureFromGeometry`, `collectionFromFeatures`, and `flattenGeometryCollection`.
These are the building blocks that the imports and exports packages will depend on.

## Target
All 8 functions exist, are exported, and pass their tests.
The functions are split across focused files: `parse.ts`, `geometry.ts`,
`feature.ts`, `guards.ts`.

## Dependencies
- Page 02-02 (geojson-schemas) — all schemas must be ready

## Inputs
- `DT-GeoJSON.md` — full function specifications for all 8 functions.
- `DT-Inputs-and-Outputs.md` — `Result<T>` pattern, reversibility.
- `DT-Zod.md` — `safeParse` usage rule.

## Outputs

| File | Purpose |
|---|---|
| `packages/geojson/src/parse.ts` | `parseGeoJson`, `parseGeoJsonFeature`, `parseGeoJsonFeatureCollection` |
| `packages/geojson/src/geometry.ts` | `getGeometryBoundingBox`, `flattenGeometryCollection` |
| `packages/geojson/src/feature.ts` | `featureFromGeometry`, `collectionFromFeatures` |
| `packages/geojson/src/guards.ts` | `isGeoJsonGeometry` |
| `packages/geojson/tests/parse.test.ts` | Parse tests |
| `packages/geojson/tests/geometry.test.ts` | Geometry utility tests |
| `packages/geojson/tests/feature.test.ts` | Feature utility tests |
| `packages/geojson/tests/guards.test.ts` | Type guard tests |

## Step-by-Step Instructions

### `parse.ts`
1. Implement `parseGeoJson(raw: unknown): Result<GeoJson>`:
   - Use `GeoJsonSchema.safeParse(raw)`.
   - On success: `{ success: true, data: parsed.data }`.
   - On failure: `{ success: false, error: { code: "invalid-input", message: ... } }`.
2. Implement `parseGeoJsonFeature(raw: unknown): Result<GeoJsonFeature>` — same pattern.
3. Implement `parseGeoJsonFeatureCollection(raw: unknown): Result<GeoJsonFeatureCollection>`.
4. Add JSDoc with `@example` to each.

### `guards.ts`
5. Implement `isGeoJsonGeometry(value: unknown): value is GeoJsonGeometry`:
   ```ts
   export function isGeoJsonGeometry(value: unknown): value is GeoJsonGeometry {
     return GeoJsonGeometrySchema.safeParse(value).success;
   }
   ```

### `feature.ts`
6. Implement `featureFromGeometry(geometry, properties?, id?): GeoJsonFeature`:
   - Returns `{ type: "Feature", geometry, properties: properties ?? {}, id }`.
   - `id` is optional and omitted if not provided.
7. Implement `collectionFromFeatures(features: GeoJsonFeature[]): GeoJsonFeatureCollection`:
   - Returns `{ type: "FeatureCollection", features }`.

### `geometry.ts`
8. Implement `getGeometryBoundingBox(geometry): [number, number, number, number]`.
   Walk all positions in the geometry and compute `[minLng, minLat, maxLng, maxLat]`.
   Handle all 7 geometry types including `GeometryCollection` (recursive).
   Use a helper `allPositions(geometry): Position[]` to collect every position.

9. Implement `flattenGeometryCollection(geometry): Exclude<GeoJsonGeometry, GeoJsonGeometryCollection>[]`.
   If the input is not a `GeometryCollection`, return `[geometry]`.
   If it is, recursively flatten all children.

### Export and test
10. Export all 8 functions from `packages/geojson/src/index.ts`.
11. Write tests:
    - `parse.test.ts`: valid Point, valid FeatureCollection, invalid JSON,
      null geometry feature, ring-not-closed polygon (must fail).
    - `geometry.test.ts`: bounding box for Point, LineString, Polygon, GeometryCollection.
      Flatten with nested GeometryCollections.
    - `feature.test.ts`: wrapping geometry, with and without properties and id.
    - `guards.test.ts`: valid geometry passes, feature does not, plain object does not.
12. Run tests and build.

## Acceptance Criteria

- [ ] All 8 functions implemented and exported
- [ ] `parseGeoJson` returns `Result<GeoJson>` using `safeParse`
- [ ] `isGeoJsonGeometry` is a proper TypeScript type guard
- [ ] `getGeometryBoundingBox` handles all 7 geometry types including `GeometryCollection`
- [ ] `flattenGeometryCollection` handles nested geometry collections
- [ ] `featureFromGeometry` defaults `properties` to `{}`
- [ ] All tests pass
- [ ] No `any` in function signatures
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `getGeometryBoundingBox` must handle `GeometryCollection` recursively.
  Write a flat `allPositions` helper that extracts every `[lng, lat]` pair from
  any geometry type — this makes the bounding-box calculation a simple
  `Math.min/max` over the flat array.
- `flattenGeometryCollection` should be tested with a 3-level-deep collection
  to confirm full recursion.
- `featureFromGeometry` defaults `properties` to `{}` (empty object), not `null`,
  because consumers almost always want a plain object they can add to.
  The `null` case is valid GeoJSON but is rarely what a builder function should default to.
