# Checklist — Page 06-03 Export to GeoJSON

- [ ] `exportToGeoJson.ts` created and exported from `index.ts`
- [ ] Returns `Result<string>` — string is valid JSON
- [ ] Default `includeBbox` is `true`
- [ ] Default `pretty` is `false`
- [ ] `applyExportFilter` applied before building collection
- [ ] `"empty-export"` error when all features filtered out
- [ ] `includeBbox: true` attaches `bbox` using `getGeometryBoundingBox`
- [ ] `includeBbox: false` → no `bbox` in output
- [ ] Null-geometry features do not cause errors
- [ ] All-null-geometry collections omit `bbox` even when `includeBbox: true`
- [ ] `pretty: true` produces indented JSON (indent 2)
- [ ] Output parses back to valid `GeoJsonFeatureCollection`
- [ ] Tests: single feature, multiple features, with/without bbox, pretty, filter, empty
- [ ] All tests pass
- [ ] `pnpm --filter @yourscope/exports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/exports/dist/` returns empty
