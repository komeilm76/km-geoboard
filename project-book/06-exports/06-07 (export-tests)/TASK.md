# Page 06-07 — Exports Package Finalization

## Summary
Completes the exports package: writes the full `help.md`, confirms all
round-trip pairs are documented, updates `CHANGELOG.md`, and runs the full
CI checklist. This is the sign-off page for the entire exports chapter.

## Target
`packages/exports/help.md` is complete. All tests pass. CI passes.
All 5 export functions and the filter utility are working and documented.

## Dependencies
- Page 06-06 (export-raster-plan) — all export functions must exist and pass tests.

## Inputs
- `DT-Exports.md` — all function specs, filter order, error codes.
- `DT-Logics.md` — `help.md` structure.
- `DT-Inputs-and-Outputs.md` — reversibility documentation requirements.

## Outputs

| File | Purpose |
|---|---|
| `packages/exports/help.md` | Complete API documentation |
| `packages/exports/CHANGELOG.md` | Updated with all 06-xx additions |

## Step-by-Step Instructions

1. Write `packages/exports/help.md`:

   **Overview** — "Serialization functions that convert internal data structures
   into standard output formats: SVG, GeoJSON, OpenLayers JSON, PDF metadata,
   and raster draw instructions. All functions are pure — they receive data and
   return strings or structured objects. No file writes, no HTTP requests, no
   canvas rendering."

   **Installation** — `npm install @yourscope/exports`.

   **Quick Start** — a code block showing `exportToSvg` end-to-end.

   **Functions** — one subsection per function:
   - `applyExportFilter(items, filter?)` — filter step table, example.
   - `exportToSvg(options)` — options table with all 6 fields and defaults, output, example.
   - `exportToGeoJson(options)` — options table, output, round-trip note.
   - `exportToOpenLayers(options)` — options table, CRS behavior, example.
   - `exportToPdfMeta(artboard, elements, options?)` — page size table,
     orientation behavior, `PdfMeta` output table, consumer PDF library example.
   - `exportToRasterPlan(artboard, elements, format, scale?, filter?)` —
     instruction types table, consumer canvas example.

   **Round-Trip Pairs** — explicitly document each pair:
   | Export | Import partner |
   |---|---|
   | `exportToSvg` | `importSvg` |
   | `exportToGeoJson` | `importGeoJson` |
   | `exportToOpenLayers` | `importOpenLayers` |

   **Filter Application Order** — reproduce the 5-step ordered list from `DT-Exports.md`.

   **Error Codes** — table:
   | Code | Description |
   |---|---|
   | `invalid-artboard` | The artboard object failed validation |
   | `invalid-elements` | One or more SVG elements failed validation |
   | `invalid-features` | One or more GeoJSON features failed validation |
   | `empty-export` | After applying filters, no content remains |
   | `unsupported-element` | Element type not supported in this export format |

   **Raster Export Notes** — explain that `exportToRasterPlan` produces
   instructions only and that the consumer executes them using a canvas API.
   Include a code example showing how a consumer would execute the plan with
   `CanvasRenderingContext2D`.

2. Update `packages/exports/CHANGELOG.md`.

3. Run the full CI suite:
   ```bash
   pnpm --filter @yourscope/exports lint
   pnpm --filter @yourscope/exports test
   pnpm --filter @yourscope/exports build
   grep -rn "^import.*zod" packages/exports/dist/
   ```

## Acceptance Criteria

- [ ] `help.md` has all required sections including Round-Trip Pairs
- [ ] Filter Application Order is documented as an ordered 5-step list
- [ ] Raster Export Notes section explains consumer-side execution
- [ ] All 5 error codes documented
- [ ] `CHANGELOG.md` updated with all additions from 06-01 to 06-07
- [ ] `pnpm --filter @yourscope/exports lint` — zero TypeScript errors
- [ ] `pnpm --filter @yourscope/exports test` — all tests green
- [ ] `pnpm --filter @yourscope/exports build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/exports/dist/` — returns empty

## Notes
- After this page, Chapter 06 is complete. Only Chapter 07 (plugins) remains.
- Verify that `packages/exports/src/index.ts` exports all public symbols:
  `applyExportFilter`, `exportToSvg`, `exportToGeoJson`, `exportToOpenLayers`,
  `exportToPdfMeta`, `exportToRasterPlan`, and all types from `types.ts`.
- The consumer canvas example in `help.md` is the only place in the entire
  project where DOM/canvas API code appears — and it is documentation only,
  not runtime code. The library itself remains DOM-free.
