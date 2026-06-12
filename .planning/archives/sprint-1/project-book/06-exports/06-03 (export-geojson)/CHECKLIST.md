# Checklist — Page 06-03 Export to GeoJSON

- [x] `exportToGeoJson.ts` created and exported from `index.ts`
- [x] Returns `Result<string>` — string is valid JSON
- [x] Default `includeBbox` is `true`
- [x] Default `pretty` is `false`
- [x] `applyExportFilter` applied before building collection
- [x] `"empty-export"` error when all features filtered out
- [x] `includeBbox: true` attaches `bbox` using `getGeometryBoundingBox`
- [x] `includeBbox: false` → no `bbox` in output
- [x] Null-geometry features do not cause errors
- [x] All-null-geometry collections omit `bbox` even when `includeBbox: true`
- [x] `pretty: true` produces indented JSON (indent 2)
- [x] Output parses back to valid `GeoJsonFeatureCollection`
- [x] Tests: single feature, multiple features, with/without bbox, pretty, filter, empty
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-exports build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-exports/dist/` returns empty
