# Changelog — km-imports

## 0.3.0

### Minor Changes

- b3fd5fc: feat(wkt): ship WKT importer as a km-plugins plugin (F-001 + F-005)

  - `importWkt` is now exported from the public index (was internal only)
  - `detectImportFormat` recognises WKT strings (`POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`, `GEOMETRYCOLLECTION` prefixes, case-insensitive, with optional Z/M/ZM modifiers)
  - `importAuto` dispatches `format: "wkt"` to `importWkt`; `AutoImportResult` and `DetectedFormat` types include the new `"wkt"` branch
  - `ImportErrorCode` now includes `"invalid-wkt"`
  - New `wktImporterPlugin: Plugin<WktImporterApi>` and `WKT_IMPORTER_PLUGIN_ID` constant exported from the package — validates the formats-as-plugins pattern for future KML/GPX/TopoJSON importers

### Patch Changes

- b3fd5fc: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [b3fd5fc]
  - @komeilm76/km-shared@0.1.2
  - @komeilm76/km-artboard@0.1.3
  - @komeilm76/km-geojson@0.1.2
  - @komeilm76/km-svg@0.1.2
  - @komeilm76/km-plugins@0.1.3

## 0.2.0

### Minor Changes

- 4e2c5c0: feat(wkt): ship WKT importer as a km-plugins plugin (F-001 + F-005)

  - `importWkt` is now exported from the public index (was internal only)
  - `detectImportFormat` recognises WKT strings (`POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`, `GEOMETRYCOLLECTION` prefixes, case-insensitive, with optional Z/M/ZM modifiers)
  - `importAuto` dispatches `format: "wkt"` to `importWkt`; `AutoImportResult` and `DetectedFormat` types include the new `"wkt"` branch
  - `ImportErrorCode` now includes `"invalid-wkt"`
  - New `wktImporterPlugin: Plugin<WktImporterApi>` and `WKT_IMPORTER_PLUGIN_ID` constant exported from the package — validates the formats-as-plugins pattern for future KML/GPX/TopoJSON importers

### Patch Changes

- 31dd255: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [31dd255]
  - @komeilm76/km-shared@0.1.1
  - @komeilm76/km-artboard@0.1.2
  - @komeilm76/km-geojson@0.1.1
  - @komeilm76/km-svg@0.1.1
  - @komeilm76/km-plugins@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [a2398e3]
  - @komeilm76/km-artboard@0.1.1

All notable changes to this package are documented here.

---

## [0.1.0] — 2026-06-11

### Added

**Types (`src/types.ts`)**

- `ImportErrorCode` — 7-variant string literal union: `"empty-input"`, `"invalid-json"`, `"invalid-xml"`, `"unknown-format"`, `"schema-mismatch"`, `"unsupported-geometry-type"`, `"unsupported-svg-element"`
- `ImportError` — structured error with `code`, `message`, and optional `position`
- `ImportWarning` — non-fatal warning with `code`, `message`, and optional `context`
- `ImportResult<T>` — discriminated union: success branch has `data` + `warnings`; failure branch has `error` + `warnings`; `warnings` always present on both branches
- `DetectedFormat` — 5-variant union: `"geojson"`, `"svg"`, `"openlayers"`, `"artboard-snapshot"`, `"unknown"`
- `AutoImportResult` — discriminated union of all 5 format branches

**Functions**

- `importGeoJson(raw)` — parses and normalizes any GeoJSON value to `GeoJsonFeatureCollection`; handles FeatureCollection, Feature, and all 7 Geometry types; normalizes null properties and numeric ids with warnings
- `importSvg(svgString)` — wraps `parseSvgDocument` from `km-svg` in `ImportResult`; emits `ImportWarning` for unsupported SVG elements
- `importOpenLayers(raw)` — strips OpenLayers `crs` metadata, warns on non-EPSG:4326 CRS, delegates to `importGeoJson`
- `importArtboardSnapshot(raw)` — validates raw input against `z.array(ArtboardSchema)` from `km-artboard`
- `detectImportFormat(raw)` — heuristic format detection returning `DetectedFormat`
- `importAuto(raw)` — unified entry point that detects format and dispatches to the appropriate importer

**Tests**

- `tests/importGeoJson.test.ts` — covers all 3 normalization paths, all 3 error codes, warning generation
- `tests/importSvg.test.ts` — covers valid SVG, unsupported element warnings, empty and malformed inputs
- `tests/importOpenLayers.test.ts` — covers no-crs, EPSG:4326, EPSG:3857, merged warnings, error paths
- `tests/importAuto.test.ts` — covers `detectImportFormat` for all 5 formats, `importArtboardSnapshot`, and `importAuto` dispatch for all 5 paths

**Documentation**

- `help.md` — full API documentation with Overview, Installation, Quick Start, Functions, Warnings vs Errors, Normalization Rules, and Error Codes sections
