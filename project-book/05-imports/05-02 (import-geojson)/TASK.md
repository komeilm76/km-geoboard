# Page 05-02 — Import GeoJSON

## Summary
Implements `importGeoJson` — parses a JSON string or plain object into a
normalized `GeoJsonFeatureCollection`. Handles the three GeoJSON root types
(FeatureCollection, Feature, Geometry) and normalizes them all to a
FeatureCollection.

## Target
`packages/km-imports/src/importGeoJson.ts` exports `importGeoJson`.
Tests cover all normalization cases, all error codes, and warning generation.

## Dependencies
- Page 05-01 (import-types)
- Page 02-02 (geojson-schemas) — all GeoJSON schemas available

## Inputs
- `DT-Imports.md` — `importGeoJson` normalization behavior, warning semantics.
- `DT-GeoJSON.md` — GeoJSON types for all three root variants.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-imports/src/importGeoJson.ts` | `importGeoJson` implementation |
| `packages/km-imports/tests/importGeoJson.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-imports/src/importGeoJson.ts`.
2. Function: `importGeoJson(raw: string | unknown): ImportResult<GeoJsonFeatureCollection>`.
3. If `raw` is `null`, `undefined`, or an empty string, return `"empty-input"` error.
4. If `raw` is a string, attempt `JSON.parse`. On failure, return `"invalid-json"` error.
5. Validate the parsed object against `GeoJsonSchema.safeParse`.
   On failure, return `"schema-mismatch"` error.
6. Normalize:
   - `FeatureCollection` → returned as-is.
   - `Feature` → wrapped in `{ type: "FeatureCollection", features: [feature] }`.
   - Any Geometry type → wrapped in a Feature (null properties), then FeatureCollection.
7. Normalize `Feature.properties = null` → `{}` (emit a warning).
8. Normalize numeric `Feature.id` → string `id` (emit a warning).
9. Return `{ success: true, data: normalizedCollection, warnings }`.
10. Write comprehensive tests.

## Acceptance Criteria

- [ ] Accepts FeatureCollection, Feature, and all 7 Geometry types
- [ ] Normalizes all inputs to FeatureCollection
- [ ] `properties: null` → `{}` with warning
- [ ] Numeric `id` → string with warning
- [ ] `"empty-input"` for null/empty
- [ ] `"invalid-json"` for non-JSON string
- [ ] `"schema-mismatch"` for valid JSON but invalid GeoJSON
- [ ] All tests pass, build clean

## Notes
- Warnings do not prevent success. A FeatureCollection with several normalized
  features emits multiple warnings but still returns `{ success: true }`.
- The `warnings` array must always be present, even when empty (`[]`).
