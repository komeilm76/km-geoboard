# Page 05-01 — Import Types

## Summary
Creates the `@yourscope/imports` package and defines every type the import
pipeline needs: `ImportResult<T>`, `ImportError`, `ImportWarning`,
`ImportErrorCode`, `DetectedFormat`, and `AutoImportResult`.

## Target
`packages/imports/src/types.ts` exports all import types. Package skeleton
builds cleanly.

## Dependencies
- Page 00-01, 00-02
- Page 01-01 (artboard-types) — `Artboard`
- Page 02-01 (geojson-types) — `GeoJsonFeatureCollection`
- Page 03-01 (svg-types) — `SvgDocument`

## Inputs
- `DT-Imports.md` — all type definitions, error codes, warning semantics.

## Outputs

| File | Purpose |
|---|---|
| `packages/imports/src/types.ts` | All import pipeline types |
| `packages/imports/src/index.ts` | Re-exports |
| `packages/imports/package.json` | Manifest with all 3 package deps |
| `packages/imports/tsconfig.json` | Extends root |
| `packages/imports/tsup.config.ts` | Build config |
| `packages/imports/help.md` | Stub |
| `packages/imports/CHANGELOG.md` | Version history |

## Step-by-Step Instructions

1. Create `packages/imports/src/types.ts`.

2. Define `ImportError`:
   ```ts
   type ImportError = {
     code: ImportErrorCode;
     message: string;
     position?: number;
   };
   ```

3. Define `ImportWarning`:
   ```ts
   type ImportWarning = {
     code: string;
     message: string;
     context?: string;
   };
   ```

4. Define `ImportErrorCode` as the 7-variant string literal union from `DT-Imports.md`:
   `"empty-input" | "invalid-json" | "invalid-xml" | "unknown-format" |
   "schema-mismatch" | "unsupported-geometry-type" | "unsupported-svg-element"`.

5. Define `ImportResult<T>`:
   ```ts
   type ImportResult<T> =
     | { success: true;  data: T; warnings: ImportWarning[] }
     | { success: false; error: ImportError; warnings: ImportWarning[] };
   ```
   Note: `warnings` is always present on both branches.

6. Define `DetectedFormat`:
   `"geojson" | "svg" | "openlayers" | "artboard-snapshot" | "unknown"`.

7. Define `AutoImportResult` as the discriminated union of all 5 format branches
   from `DT-Imports.md`.

8. Export all types from `index.ts`.

9. Create `packages/imports/package.json` with dependencies:
   `@yourscope/shared`, `@yourscope/geojson`, `@yourscope/svg`, `@yourscope/artboard`.
   Add `zod` as peer + dev.

10. Create all other package files. Build.

## Acceptance Criteria

- [ ] `ImportResult<T>` has `warnings` on both success and failure branches
- [ ] `ImportErrorCode` has all 7 error codes
- [ ] `AutoImportResult` covers all 5 format variants including `"unknown"`
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `ImportResult<T>` is NOT the same as `Result<T>` from `@yourscope/shared`.
  It adds `warnings: ImportWarning[]` to both branches. Use `ImportResult<T>`
  in all importer function signatures, not the generic `Result<T>`.
