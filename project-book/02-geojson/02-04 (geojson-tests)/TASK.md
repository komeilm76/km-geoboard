# Page 02-04 — GeoJSON Package Finalization

## Summary
Completes the GeoJSON package: writes the full `help.md`, ensures all error
codes are documented, and runs the complete CI checklist. This is the sign-off
page for the entire GeoJSON chapter.

## Target
`packages/km-geojson/help.md` is complete. All tests pass. CI passes.
The package is ready to be depended on by Chapters 03, 04, 05, and 06.

## Dependencies
- Page 02-03 (geojson-parse) — all functions must exist and pass tests

## Inputs
- `DT-GeoJSON.md` — error codes table, all function specs.
- `DT-Logics.md` — `help.md` required sections.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-geojson/help.md` | Complete API documentation |
| `packages/km-geojson/CHANGELOG.md` | Updated with all 02-xx additions |

## Step-by-Step Instructions

1. Write `packages/km-geojson/help.md` with all required sections:

   **Overview** — "GeoJSON types and validation for RFC 7946. Use this package
   to parse, validate, and construct GeoJSON data in any environment."

   **Installation** — `npm install @komeilm76/km-geojson`.

   **Functions** — one subsection each for:
   - `parseGeoJson` — accepts `unknown`, returns `Result<GeoJson>`.
   - `parseGeoJsonFeature` — same pattern.
   - `parseGeoJsonFeatureCollection` — same pattern.
   - `isGeoJsonGeometry` — type guard, returns `boolean`.
   - `getGeometryBoundingBox` — input geometry, returns `[w, s, e, n]` tuple.
   - `flattenGeometryCollection` — input `GeoJsonGeometry`, returns flat array.
   - `featureFromGeometry` — wraps geometry in a Feature.
   - `collectionFromFeatures` — wraps array in a FeatureCollection.
   Each entry: description, input table, output description, code example.

   **Types** — field tables for `Position`, `BoundingBox`, `LinearRing`,
   `GeoJsonPoint`, `GeoJsonPolygon`, `GeoJsonFeature`, `GeoJsonFeatureCollection`.
   Include the longitude-first warning prominently.

   **Errors** — table with all 5 error codes from `DT-GeoJSON.md`:
   `invalid-input`, `invalid-geometry-type`, `ring-not-closed`,
   `ring-too-short`, `linestring-too-short`.

   **Coordinate System** — short section explaining WGS84, `[longitude, latitude]`
   order, and the altitude optional third element.

2. Update `packages/km-geojson/CHANGELOG.md`:
   Under `## [0.1.0]`, list every type, schema, and function added.

3. Run the full CI suite:
   ```bash
   pnpm --filter @komeilm76/km-geojson lint
   pnpm --filter @komeilm76/km-geojson test
   pnpm --filter @komeilm76/km-geojson build
   grep -rn "^import.*zod" packages/km-geojson/dist/
   ```

## Acceptance Criteria

- [ ] `help.md` has all 6 required sections
- [ ] Every function documented with input table and code example
- [ ] Longitude-first coordinate warning is prominently placed
- [ ] All 5 error codes documented in the Errors section
- [ ] `CHANGELOG.md` lists all types, schemas, and functions
- [ ] `pnpm --filter @komeilm76/km-geojson lint` — zero errors
- [ ] `pnpm --filter @komeilm76/km-geojson test` — all green
- [ ] `pnpm --filter @komeilm76/km-geojson build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/km-geojson/dist/` — empty

## Notes
- After this page the GeoJSON chapter is complete. Other packages will import
  from `@komeilm76/km-geojson`. Make sure the public `index.ts` exports are correct
  and stable before moving on.
- The error codes `ring-not-closed`, `ring-too-short`, `linestring-too-short`
  are produced by Zod `.refine()` validators in `schemas.ts`. Verify the
  `message` strings in those refinements match the codes documented in `help.md`.
- This package has no DOM dependency. Verify by reviewing the compiled `dist/`
  for any `window`, `document`, or `HTMLElement` references.
