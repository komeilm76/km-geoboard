# Checklist — Page 06-04 Export to OpenLayers

- [ ] `exportToOpenLayers.ts` created and exported from `index.ts`
- [ ] Returns `Result<string>`
- [ ] Default `projection` is `"EPSG:4326"`
- [ ] EPSG:4326 output has no `crs` field
- [ ] Non-EPSG:4326 output has `crs: { type: "name", properties: { name: "..." } }`
- [ ] Delegates to `exportToGeoJson` for core serialization
- [ ] Errors from `exportToGeoJson` propagated unchanged
- [ ] Output is valid JSON with a `FeatureCollection`
- [ ] `pretty` option works (passed through to `exportToGeoJson`)
- [ ] Tests: EPSG:4326 (no crs), EPSG:3857 (with crs), empty-export error
- [ ] All tests pass
- [ ] `pnpm --filter @yourscope/exports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/exports/dist/` returns empty
