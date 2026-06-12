# Page 06-04 — Export to OpenLayers

## Summary
Implements `exportToOpenLayers` — produces an OpenLayers-compatible GeoJSON
string, optionally including projection metadata. Delegates to `exportToGeoJson`
for the core serialization and adds the OpenLayers-specific envelope.

## Target
`packages/km-exports/src/exportToOpenLayers.ts` exports `exportToOpenLayers`.
Tests verify the projection metadata and delegation behavior.

## Dependencies
- Page 06-03 (export-geojson) — `exportToGeoJson` is reused internally

## Inputs
- `DT-Exports.md` — `exportToOpenLayers` spec, `OpenLayersExportOptions`.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-exports/src/exportToOpenLayers.ts` | `exportToOpenLayers` implementation |
| `packages/km-exports/tests/exportToOpenLayers.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-exports/src/exportToOpenLayers.ts`.
2. Function: `exportToOpenLayers(options: OpenLayersExportOptions): Result<string>`.
3. Destructure with defaults:
   ```ts
   const { features, projection = "EPSG:4326", filter, pretty = false } = options;
   ```
4. Delegate to `exportToGeoJson({ features, filter, includeBbox: true, pretty })`.
5. On failure, return the error unchanged.
6. On success, parse the GeoJSON string back to an object, add the `crs` field:
   ```ts
   const obj = JSON.parse(result.data);
   if (projection !== "EPSG:4326") {
     obj.crs = {
       type: "name",
       properties: { name: projection },
     };
   }
   return { success: true, data: JSON.stringify(obj, null, pretty ? 2 : 0) };
   ```
   Note: only add `crs` when the projection is not EPSG:4326. For EPSG:4326,
   GeoJSON is the standard and no `crs` annotation is needed.

7. Write tests:
   - Default projection (EPSG:4326) → no `crs` field in output.
   - Custom projection (e.g. EPSG:3857) → `crs` field present with correct name.
   - `"empty-export"` propagated from `exportToGeoJson`.
   - Output is valid JSON with a `FeatureCollection`.

## Acceptance Criteria

- [x] Default `projection` is `"EPSG:4326"`
- [x] No `crs` field when projection is EPSG:4326
- [x] `crs` field added when projection differs from EPSG:4326
- [x] Errors from `exportToGeoJson` propagated unchanged
- [x] Output is valid JSON
- [x] All tests pass, build clean

## Notes
- Parsing and re-serializing the JSON string is a simple approach. An alternative
  is to build the object directly without going through a string, but delegating
  to `exportToGeoJson` keeps the code DRY.
- The `crs` format used here (`{ type: "name", properties: { name: "EPSG:3857" } }`)
  is the OpenLayers convention. It mirrors what `importOpenLayers` strips.
  Together these two functions form a complete round-trip for OpenLayers data.
