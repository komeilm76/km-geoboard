# Checklist — Page 05-02 Import GeoJSON

- [x] `importGeoJson.ts` created and exported from `index.ts`
- [x] Accepts `string | unknown` — parses JSON strings automatically
- [x] Returns `ImportResult<GeoJsonFeatureCollection>` (with `warnings`)
- [x] `FeatureCollection` input returned normalized
- [x] `Feature` input wrapped in FeatureCollection
- [x] `Geometry` input wrapped in Feature then FeatureCollection
- [x] `properties: null` normalized to `{}` with warning emitted
- [x] Numeric `id` normalized to string with warning emitted
- [x] Empty input returns `{ code: "empty-input" }` error
- [x] Non-JSON string returns `{ code: "invalid-json" }` error
- [x] Valid JSON but invalid GeoJSON returns `{ code: "schema-mismatch" }` error
- [x] `warnings` array always present (empty `[]` when no warnings)
- [x] Tests cover all 3 normalization paths (FeatureCollection, Feature, Geometry)
- [x] Tests cover all 3 error codes
- [x] Tests cover warning generation
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-imports build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
