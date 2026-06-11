# Checklist — Page 05-05 Import Auto and Artboard Snapshot

- [ ] `importArtboardSnapshot.ts` created and exported
- [ ] Validates against `z.array(ArtboardSchema)` using `safeParse`
- [ ] Returns `ImportResult<Artboard[]>`
- [ ] `detectImportFormat.ts` created and exported
- [ ] Detects `"svg"` from XML string starting with `"<"`
- [ ] Detects `"geojson"` from object with `type: "FeatureCollection"` (no crs)
- [ ] Detects `"openlayers"` from FeatureCollection with `crs` field
- [ ] Detects `"artboard-snapshot"` from array of objects with `origin` and `size`
- [ ] Returns `"unknown"` for unrecognized input
- [ ] `importAuto.ts` created and exported
- [ ] Returns `AutoImportResult` with `format` field
- [ ] Dispatches to correct importer for each format
- [ ] Returns `{ format: "unknown", result: { success: false } }` for unknown input
- [ ] Tests cover all 5 detection cases
- [ ] `importAuto.test.ts` covers all 5 dispatch paths
- [ ] All tests pass
- [ ] `pnpm --filter @komeilm76/km-imports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
