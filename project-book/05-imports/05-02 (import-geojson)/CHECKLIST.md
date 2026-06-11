# Checklist — Page 05-02 Import GeoJSON

- [ ] `importGeoJson.ts` created and exported from `index.ts`
- [ ] Accepts `string | unknown` — parses JSON strings automatically
- [ ] Returns `ImportResult<GeoJsonFeatureCollection>` (with `warnings`)
- [ ] `FeatureCollection` input returned normalized
- [ ] `Feature` input wrapped in FeatureCollection
- [ ] `Geometry` input wrapped in Feature then FeatureCollection
- [ ] `properties: null` normalized to `{}` with warning emitted
- [ ] Numeric `id` normalized to string with warning emitted
- [ ] Empty input returns `{ code: "empty-input" }` error
- [ ] Non-JSON string returns `{ code: "invalid-json" }` error
- [ ] Valid JSON but invalid GeoJSON returns `{ code: "schema-mismatch" }` error
- [ ] `warnings` array always present (empty `[]` when no warnings)
- [ ] Tests cover all 3 normalization paths (FeatureCollection, Feature, Geometry)
- [ ] Tests cover all 3 error codes
- [ ] Tests cover warning generation
- [ ] All tests pass
- [ ] `pnpm --filter @komeilm76/km-imports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
