# Page 05-06 — Imports Package Finalization

## Summary
Completes the imports package: writes the full `help.md`, updates `CHANGELOG.md`,
and runs the full CI checklist. This is the sign-off page for the entire imports
chapter.

## Target
`packages/imports/help.md` is complete. All tests pass. CI passes.
The package is ready to be depended on by Chapter 06.

## Dependencies
- Page 05-05 (import-auto) — all import functions must exist and pass tests.

## Inputs
- `DT-Imports.md` — all function specs, normalization rules, error/warning table.
- `DT-Logics.md` — `help.md` required sections.

## Outputs

| File | Purpose |
|---|---|
| `packages/imports/help.md` | Complete API documentation |
| `packages/imports/CHANGELOG.md` | Updated with all 05-xx additions |

## Step-by-Step Instructions

1. Write `packages/imports/help.md`:

   **Overview** — "Parse raw strings and objects into typed internal structures.
   Supports GeoJSON, SVG, OpenLayers, and artboard snapshots. Every importer
   returns `ImportResult<T>` — a success with optional warnings or a failure
   with a structured error code."

   **Installation** — `npm install @yourscope/imports`.

   **Quick Start** — show `importAuto` in one code block so a reader can see
   the end-to-end flow immediately.

   **Functions** — one subsection per function:
   - `importGeoJson(raw)` — input table, normalization list, output, example.
   - `importSvg(svgString)` — input, output, warning example.
   - `importOpenLayers(raw)` — input, CRS behavior, output, example.
   - `importArtboardSnapshot(raw)` — input, output, example.
   - `detectImportFormat(raw)` — detection logic table (format → signal), example.
   - `importAuto(raw)` — input, output union, full example showing format dispatch.

   **Warnings vs Errors** — reproduce the two-column table from `DT-Imports.md`
   exactly (situation → type).

   **Normalization Rules** — bullet list of all normalization behaviors:
   - `Feature.properties = null` → `{}`
   - Numeric `id` → string
   - OpenLayers `crs` field stripped
   - `Feature` input wrapped in `FeatureCollection`
   - `Geometry` input wrapped in `Feature` then `FeatureCollection`

   **Error Codes** — table with all 7 codes and their descriptions:
   `empty-input`, `invalid-json`, `invalid-xml`, `unknown-format`,
   `schema-mismatch`, `unsupported-geometry-type`, `unsupported-svg-element`.

2. Update `packages/imports/CHANGELOG.md`:
   Under `## [0.1.0]`, list every function and type added.

3. Run the full CI suite:
   ```bash
   pnpm --filter @yourscope/imports lint
   pnpm --filter @yourscope/imports test
   pnpm --filter @yourscope/imports build
   grep -rn "^import.*zod" packages/imports/dist/
   ```

## Acceptance Criteria

- [ ] `help.md` has all required sections (Overview, Installation, Quick Start,
  Functions, Warnings vs Errors, Normalization Rules, Error Codes)
- [ ] Every function documented with input table and code example
- [ ] Warnings vs Errors table is complete
- [ ] All 7 error codes are documented
- [ ] Normalization rules are listed
- [ ] `CHANGELOG.md` covers all items added in pages 05-01 through 05-06
- [ ] `pnpm --filter @yourscope/imports lint` — zero TypeScript errors
- [ ] `pnpm --filter @yourscope/imports test` — all tests green
- [ ] `pnpm --filter @yourscope/imports build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/imports/dist/` — returns empty

## Notes
- After this page, Chapter 05 is complete.
- `@yourscope/exports` (Chapter 06) does not depend on `@yourscope/imports`.
  They are sibling packages — both depend on the domain packages but not on
  each other.
- Verify the public `index.ts` exports the correct set of functions and types
  before moving on to Chapter 06. Specifically confirm that:
  - `importGeoJson`, `importSvg`, `importOpenLayers`, `importArtboardSnapshot`,
    `detectImportFormat`, `importAuto` are all exported.
  - `ImportResult`, `ImportError`, `ImportWarning`, `ImportErrorCode`,
    `DetectedFormat`, `AutoImportResult` are all exported as types.
