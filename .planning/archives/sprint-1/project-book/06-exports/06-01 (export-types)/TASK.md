# Page 06-01 — Export Types

## Summary
Creates the `@komeilm76/km-exports` package and defines every type the export
pipeline needs: `ExportFilter`, `SvgExportOptions`, `GeoJsonExportOptions`,
`OpenLayersExportOptions`, `PdfMeta`, `RasterDrawInstruction`, and
`RasterExportPlan`. No logic — types only.

## Target
`packages/km-exports/src/types.ts` exports all export pipeline types.
Package skeleton builds cleanly.

## Dependencies
- Page 00-01, 00-02
- Page 01-01 (artboard-types) — `Artboard`
- Page 02-01 (geojson-types) — `GeoJsonFeature`
- Page 03-01 (svg-types) — `SvgElement`

## Inputs
- `DT-Exports.md` — complete type definitions for all export option types,
  `PdfMeta`, `RasterExportPlan`, `RasterDrawInstruction`.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-exports/src/types.ts` | All export pipeline types |
| `packages/km-exports/src/index.ts` | Public re-exports |
| `packages/km-exports/package.json` | Package manifest |
| `packages/km-exports/tsconfig.json` | Extends root config |
| `packages/km-exports/tsup.config.ts` | Build config |
| `packages/km-exports/help.md` | Documentation stub |
| `packages/km-exports/CHANGELOG.md` | Version history |
| `packages/km-exports/README.md` | npm display page |

## Step-by-Step Instructions

1. Create `packages/km-exports/src/types.ts`. No Zod imports.

2. Define `ExportFilter` with all 5 optional fields from `DT-Exports.md`:
   `includeIds?`, `excludeIds?`, `includeLayers?`, `excludeLayers?`, `boundingBox?`.
   Add JSDoc to every field.

3. Define `SvgExportOptions` with all 6 fields:
   `artboard: Artboard`, `elements: SvgElement[]`, `filter?: ExportFilter`,
   `inlineAssets?: boolean`, `xmlDeclaration?: boolean`, `pretty?: boolean`.
   Add `@default` JSDoc to every optional field.

4. Define `GeoJsonExportOptions`:
   `features: GeoJsonFeature[]`, `filter?: ExportFilter`,
   `includeBbox?: boolean`, `pretty?: boolean`.

5. Define `OpenLayersExportOptions`:
   `features: GeoJsonFeature[]`, `projection?: string`, `filter?: ExportFilter`,
   `pretty?: boolean`.
   JSDoc `@default "EPSG:4326"` on `projection`.

6. Define `PdfMeta` exactly as in `DT-Exports.md`:
   `pageSize: { width: number; height: number }`,
   `orientation: "portrait" | "landscape"`,
   `svgContent: string`,
   `artboard: Artboard`,
   optional `title?: string`, `author?: string`.

7. Define `RasterDrawInstruction` as the 4-variant discriminated union on `type`:
   `"rect"`, `"path"`, `"circle"`, `"text"`.
   Every variant has at minimum `type`, coordinate fields, and `fill: string`.

8. Define `RasterExportPlan`:
   `canvasWidth: number`, `canvasHeight: number`, `background: string`,
   `instructions: RasterDrawInstruction[]`, `format: "png" | "jpeg"`,
   `quality?: number`.
   JSDoc `@default "#ffffff"` for background and `@default 0.92` for quality.

9. Export all types from `index.ts`.

10. Create `packages/km-exports/package.json`:
    - `"name": "@komeilm76/km-exports"`, `"version": "0.1.0"`.
    - Dependencies: `@komeilm76/km-shared`, `@komeilm76/km-artboard`,
      `@komeilm76/km-geojson`, `@komeilm76/km-svg`.
    - `zod` as peer + dev.
    - `check-zod` script.

11. Create all other package files. Build.

## Acceptance Criteria

- [x] All 8 types exported from `types.ts` — no Zod imports
- [x] `ExportFilter` has all 5 optional fields
- [x] `RasterDrawInstruction` is a discriminated union on `type`
- [x] `PdfMeta` has `svgContent: string` and `artboard: Artboard`
- [x] Every optional field has `@default` JSDoc
- [x] Build succeeds, Zod-leak check passes

## Notes
- `RasterExportPlan.quality` only applies to JPEG. The JSDoc must note this.
- `PdfMeta` is not a Blob or Buffer — it is a plain data object that the
  consumer passes to their own PDF library. There is no PDF generation in
  this package. Make this explicit in the JSDoc for `PdfMeta`.
- The `boundingBox` field in `ExportFilter` uses canvas coordinate space
  (artboard units), not geographic coordinates. JSDoc must state this clearly.
