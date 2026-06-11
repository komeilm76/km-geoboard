# Checklist — Page 02-04 GeoJSON Package Finalization

- [ ] `help.md` has Overview section
- [ ] `help.md` has Installation section
- [ ] `help.md` has Functions section (all 8 functions)
- [ ] Each function in `help.md` has input table and code example
- [ ] `help.md` has Types section (at minimum: `Position`, `GeoJsonFeature`, `GeoJsonFeatureCollection`)
- [ ] `help.md` has Errors section with all 5 error codes
- [ ] `help.md` has Coordinate System section with longitude-first warning
- [ ] `CHANGELOG.md` updated with all additions
- [ ] `pnpm --filter @komeilm76/km-geojson lint` — zero TypeScript errors
- [ ] `pnpm --filter @komeilm76/km-geojson test` — all tests green
- [ ] `pnpm --filter @komeilm76/km-geojson build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/km-geojson/dist/` — returns empty
