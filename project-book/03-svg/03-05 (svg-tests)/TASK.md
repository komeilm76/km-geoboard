# Page 03-05 — SVG Package Finalization

## Summary
Completes the SVG package: writes the full `help.md`, ensures all error codes
are documented, updates `CHANGELOG.md`, and runs the full CI checklist.

## Target
`packages/svg/help.md` is complete. All tests pass. CI passes.
The package is ready for use by Chapters 05 and 06.

## Dependencies
- Page 03-04 (svg-to-geojson)

## Inputs
- `DT-SVG.md` — function specs, error codes.
- `DT-Logics.md` — `help.md` structure.

## Outputs

| File | Purpose |
|---|---|
| `packages/svg/help.md` | Complete API documentation |
| `packages/svg/CHANGELOG.md` | Updated |

## Step-by-Step Instructions

1. Write `packages/svg/help.md`:

   **Overview** — "SVG content as structured data. Parse SVG XML into typed
   element trees, manipulate paths, and convert SVG geometry to GeoJSON."

   **Installation** — `npm install @yourscope/svg`.

   **Functions**:
   - `parseSvgDocument(svgString)` — input, output, example.
   - `parseSvgPath(d)` — input, output, example.
   - `serializeSvgPath(commands)` — input, output, round-trip example.
   - `svgPointToGeoPosition(point, meta)` — input table with formula note.
   - `svgElementToGeoJsonFeature(element, meta)` — element-to-geometry mapping table.
   - `svgDocumentToFeatureCollection(doc, meta)` — end-to-end example.

   **Types** — field tables for:
   `SvgDocument`, `SvgViewBox`, `SvgLength`, `SvgColor` (5 variants),
   `SvgTransformOperation` (6 variants), `SvgGeoMeta`.
   Element types summary table (type → key fields).

   **SVG Element → GeoJSON Mapping** — reproduce the table from `DT-SVG.md`.

   **Errors** — table:
   | Code | Meaning |
   |---|---|
   | `invalid-xml` | XML parse failed |
   | `invalid-input` | Schema validation failed |
   | `unsupported-svg-element` | Element type cannot be converted |

2. Update `packages/svg/CHANGELOG.md`.

3. Run full CI suite:
   ```bash
   pnpm --filter @yourscope/svg lint
   pnpm --filter @yourscope/svg test
   pnpm --filter @yourscope/svg build
   grep -rn "^import.*zod" packages/svg/dist/
   ```

## Acceptance Criteria

- [ ] `help.md` has all required sections
- [ ] Element → GeoJSON mapping table included
- [ ] All error codes documented
- [ ] `pnpm --filter @yourscope/svg lint` — zero errors
- [ ] `pnpm --filter @yourscope/svg test` — all green
- [ ] `pnpm --filter @yourscope/svg build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/svg/dist/` — empty

## Notes
- After this page, Chapter 03 is complete.
  Chapters 05 and 06 can now depend on `@yourscope/svg`.
