# Page 05-03 — Import SVG

## Summary
Implements `importSvg` — wraps `parseSvgDocument` from `@komeilm76/km-svg` in the
`ImportResult` interface and translates error codes. Unsupported SVG elements
produce warnings, not errors.

## Target
`packages/km-imports/src/importSvg.ts` exports `importSvg`.
Tests verify warning generation for unsupported elements.

## Dependencies
- Page 05-01 (import-types)
- Page 03-03 (svg-parse) — `parseSvgDocument` from `@komeilm76/km-svg`

## Inputs
- `DT-Imports.md` — `importSvg` spec, warning vs error distinction.
- `DT-SVG.md` — `parseSvgDocument` and `SvgDocument`.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-imports/src/importSvg.ts` | `importSvg` implementation |
| `packages/km-imports/tests/importSvg.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-imports/src/importSvg.ts`.
2. Function: `importSvg(svgString: string): ImportResult<SvgDocument>`.
3. Guard: if `svgString` is empty, return `"empty-input"` error.
4. Call `parseSvgDocument(svgString)` from `@komeilm76/km-svg`.
5. On `parseSvgDocument` failure: map `"invalid-xml"` to the import error.
6. On success: collect any warnings about skipped elements from the parse result
   and translate them into `ImportWarning` objects with `code: "unsupported-svg-element"`.
7. Return `{ success: true, data: svgDocument, warnings }`.

8. Write tests:
   - Valid SVG with rect → success with empty warnings.
   - SVG with unsupported `<image>` → success with one warning.
   - Empty string → `"empty-input"` error.
   - Malformed XML → `"invalid-xml"` error.

## Acceptance Criteria

- [ ] `importSvg` returns `ImportResult<SvgDocument>`
- [ ] Unsupported elements produce `ImportWarning` objects, not errors
- [ ] Error code `"empty-input"` for empty string
- [ ] Error code `"invalid-xml"` for malformed input
- [ ] `warnings` always present
- [ ] All tests pass, build clean

---

# Page 05-04 — Import OpenLayers

## Summary
Implements `importOpenLayers` — parses OpenLayers vector source JSON into a
standard `GeoJsonFeatureCollection`. Strips the `crs` field and emits a warning
if it differs from EPSG:4326.

## Target
`packages/km-imports/src/importOpenLayers.ts` exports `importOpenLayers`.
CRS stripping and warning behavior tested.

## Dependencies
- Page 05-02 (import-geojson) — can delegate to `importGeoJson` internally

## Inputs
- `DT-Imports.md` — `importOpenLayers` normalization behavior, CRS handling.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-imports/src/importOpenLayers.ts` | `importOpenLayers` implementation |
| `packages/km-imports/tests/importOpenLayers.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-imports/src/importOpenLayers.ts`.
2. Function: `importOpenLayers(raw: string | unknown): ImportResult<GeoJsonFeatureCollection>`.
3. Parse the raw input (JSON string or object).
4. Extract and strip the `crs` field if present.
   If `crs` is present and is not `"EPSG:4326"`, emit a warning:
   `{ code: "crs-stripped", message: "CRS '...' stripped; output is EPSG:4326" }`.
5. Strip any other OpenLayers-specific metadata fields at the root.
6. Delegate to `importGeoJson` with the cleaned object.
7. Merge warnings from `crs` stripping with warnings from `importGeoJson`.
8. Return the merged result.

9. Write tests covering: standard GeoJSON (no crs), OpenLayers JSON with crs,
   crs = EPSG:4326 (no warning), crs = EPSG:3857 (warning emitted).

## Acceptance Criteria

- [ ] `importOpenLayers` strips `crs` field
- [ ] Non-EPSG:4326 crs emits a warning
- [ ] Standard GeoJSON (no crs field) passes through cleanly
- [ ] All warnings merged and returned
- [ ] All tests pass, build clean

---

# Page 05-05 — Import Auto and Artboard Snapshot

## Summary
Implements `importArtboardSnapshot`, `detectImportFormat`, and `importAuto` —
the format-detection and unified entry-point functions.

## Target
All three functions exist, are exported, and are tested.

## Dependencies
- Page 05-02, 05-03, 05-04

## Inputs
- `DT-Imports.md` — detection logic, `importAuto` union type.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-imports/src/importArtboardSnapshot.ts` | `importArtboardSnapshot` |
| `packages/km-imports/src/detectImportFormat.ts` | `detectImportFormat` |
| `packages/km-imports/src/importAuto.ts` | `importAuto` |
| `packages/km-imports/tests/importAuto.test.ts` | Tests |

## Step-by-Step Instructions

### `importArtboardSnapshot`
1. Import `ArtboardSchema` from `@komeilm76/km-artboard`.
2. Validate raw input against `z.array(ArtboardSchema).safeParse(parsed)`.
3. Return `ImportResult<Artboard[]>`.

### `detectImportFormat`
4. Implement the detection heuristics from `DT-Imports.md`:
   - String starting with `"<"` and containing `"svg"` (case-insensitive) → `"svg"`.
   - Object with `type: "FeatureCollection"` or `type: "Feature"` and no `crs` → `"geojson"`.
   - Object with `type: "FeatureCollection"` and a top-level `crs` field → `"openlayers"`.
   - Array of objects each having `origin` and `size` → `"artboard-snapshot"`.
   - Otherwise → `"unknown"`.

### `importAuto`
5. Call `detectImportFormat(raw)`.
6. Dispatch to the correct importer.
7. Return `AutoImportResult` with the detected format and result.

### Tests
8. Write tests for `detectImportFormat` for each format.
9. Write `importAuto.test.ts` covering all 5 format paths.

## Acceptance Criteria

- [ ] `importArtboardSnapshot` validates against `ArtboardSchema`
- [ ] `detectImportFormat` correctly identifies all 5 formats
- [ ] `importAuto` dispatches to the correct importer
- [ ] `importAuto` returns `{ format: "unknown" }` for unrecognized input
- [ ] All tests pass, build clean

---

# Page 05-06 — Imports Package Finalization

## Summary
Completes `help.md`, updates `CHANGELOG.md`, and signs off the imports chapter.

## Target
`packages/km-imports/help.md` complete. CI passes.

## Dependencies
- Page 05-05

## Outputs

| File | Purpose |
|---|---|
| `packages/km-imports/help.md` | Complete API documentation |
| `packages/km-imports/CHANGELOG.md` | Updated |

## Step-by-Step Instructions

1. Write `packages/km-imports/help.md`:

   **Overview** — "Parse raw strings and objects into typed internal structures.
   Supports GeoJSON, SVG, OpenLayers, and artboard snapshots."

   **Installation**.

   **Functions** — one subsection each for all 6 functions:
   `importGeoJson`, `importSvg`, `importOpenLayers`, `importArtboardSnapshot`,
   `detectImportFormat`, `importAuto`. Each with input table, output, example.

   **Warnings vs Errors** — reproduce the table from `DT-Imports.md`.

   **Normalization Behavior** — list all normalization rules.

   **Error Codes** — all 7 codes with descriptions.

2. Run full CI for `@komeilm76/km-imports`.

## Acceptance Criteria

- [ ] `help.md` complete with all sections
- [ ] Warnings vs Errors table included
- [ ] All 7 error codes documented
- [ ] Full CI suite passes
- [ ] Zod-leak check returns empty
