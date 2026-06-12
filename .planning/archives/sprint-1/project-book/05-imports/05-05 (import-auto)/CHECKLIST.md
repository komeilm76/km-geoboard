# Checklist — Page 05-05 Import Auto and Artboard Snapshot

- [x] `importArtboardSnapshot.ts` created and exported
- [x] Validates against `z.array(ArtboardSchema)` using `safeParse`
- [x] Returns `ImportResult<Artboard[]>`
- [x] `detectImportFormat.ts` created and exported
- [x] Detects `"svg"` from XML string starting with `"<"`
- [x] Detects `"geojson"` from object with `type: "FeatureCollection"` (no crs)
- [x] Detects `"openlayers"` from FeatureCollection with `crs` field
- [x] Detects `"artboard-snapshot"` from array of objects with `origin` and `size`
- [x] Returns `"unknown"` for unrecognized input
- [x] `importAuto.ts` created and exported
- [x] Returns `AutoImportResult` with `format` field
- [x] Dispatches to correct importer for each format
- [x] Returns `{ format: "unknown", result: { success: false } }` for unknown input
- [x] Tests cover all 5 detection cases
- [x] `importAuto.test.ts` covers all 5 dispatch paths
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-imports build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
