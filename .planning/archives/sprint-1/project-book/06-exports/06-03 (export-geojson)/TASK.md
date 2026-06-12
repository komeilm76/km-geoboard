# Page 06-03 — Export to GeoJSON

## Summary
Implements `exportToGeoJson` — serializes an array of `GeoJsonFeature` objects
into a GeoJSON `FeatureCollection` string. Applies the export filter and
optionally computes a root `bbox`.

## Target
`packages/km-exports/src/exportToGeoJson.ts` exports `exportToGeoJson`.
Tests pass for filtering, bbox computation, and pretty-printing.

## Dependencies
- Page 06-02 (export-svg) — `applyExportFilter` is already available
- Page 02-03 (geojson-parse) — `getGeometryBoundingBox` from `@komeilm76/km-geojson`

## Inputs
- `DT-Exports.md` — `exportToGeoJson` spec, `GeoJsonExportOptions`.
- `DT-GeoJSON.md` — `GeoJsonFeatureCollection` structure.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-exports/src/exportToGeoJson.ts` | `exportToGeoJson` implementation |
| `packages/km-exports/tests/exportToGeoJson.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-exports/src/exportToGeoJson.ts`.
2. Function: `exportToGeoJson(options: GeoJsonExportOptions): Result<string>`.
3. Destructure with defaults:
   ```ts
   const { features, filter, includeBbox = true, pretty = false } = options;
   ```
4. Apply `applyExportFilter(features, filter)`.
5. If filtered result is empty, return `{ success: false, error: { code: "empty-export" } }`.
6. Build the `GeoJsonFeatureCollection` object:
   ```ts
   const collection: GeoJsonFeatureCollection = {
     type: "FeatureCollection",
     features: filtered,
   };
   ```
7. If `includeBbox` is true, compute the bounding box by collecting all
   geometry bounding boxes across all features and taking the union.
   Use `getGeometryBoundingBox` from `@komeilm76/km-geojson` for each feature's geometry.
   Skip features with `null` geometry.
   Attach the result as `collection.bbox`.
8. Serialize: `JSON.stringify(collection, null, pretty ? 2 : 0)`.
9. Return `{ success: true, data: jsonString }`.

10. Write tests:
    - Single feature → valid FeatureCollection JSON string.
    - Multiple features → array in output.
    - `includeBbox: true` → `bbox` present on root.
    - `includeBbox: false` → no `bbox` on root.
    - `pretty: true` → indented JSON.
    - Filter by `includeIds` → only matching features in output.
    - All features filtered out → `"empty-export"` error.
    - Features with `null` geometry → handled without error (bbox skipped for those).

## Acceptance Criteria

- [x] `exportToGeoJson` returns `Result<string>` where string is valid JSON
- [x] Output parses back to a `GeoJsonFeatureCollection`
- [x] `includeBbox: true` attaches a correct `bbox` to the collection
- [x] `pretty: true` uses `JSON.stringify` with indent 2
- [x] Filter is applied before bbox computation
- [x] `"empty-export"` when all features filtered out
- [x] Null-geometry features are handled without errors
- [x] All tests pass, build clean

## Notes
- The bbox computation is a union of all feature geometry bounding boxes.
  Use `getGeometryBoundingBox` per feature and compute the overall min/max.
  If ALL features have null geometry, omit the `bbox` field entirely even if
  `includeBbox` is true (there is nothing to compute from).
- `exportToGeoJson` is the reverse of `importGeoJson`. Both are clean, tested,
  and the pair together covers the full GeoJSON round-trip.
