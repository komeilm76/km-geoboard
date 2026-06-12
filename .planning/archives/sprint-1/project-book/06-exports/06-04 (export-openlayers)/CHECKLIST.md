# Checklist — Page 06-04 Export to OpenLayers

- [x] `exportToOpenLayers.ts` created and exported from `index.ts`
- [x] Returns `Result<string>`
- [x] Default `projection` is `"EPSG:4326"`
- [x] EPSG:4326 output has no `crs` field
- [x] Non-EPSG:4326 output has `crs: { type: "name", properties: { name: "..." } }`
- [x] Delegates to `exportToGeoJson` for core serialization
- [x] Errors from `exportToGeoJson` propagated unchanged
- [x] Output is valid JSON with a `FeatureCollection`
- [x] `pretty` option works (passed through to `exportToGeoJson`)
- [x] Tests: EPSG:4326 (no crs), EPSG:3857 (with crs), empty-export error
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-exports build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-exports/dist/` returns empty
