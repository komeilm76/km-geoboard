# Changelog — km-exports

All user-visible changes are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — Initial release

### Added (06-01 — Export Types)
- `ExportFilter` type with 5 optional fields: `includeIds`, `excludeIds`, `includeLayers`, `excludeLayers`, `boundingBox`.
- `SvgExportOptions` type with `artboard`, `elements`, `filter`, `inlineAssets`, `xmlDeclaration`, `pretty` fields.
- `GeoJsonExportOptions` type with `features`, `filter`, `includeBbox`, `pretty` fields.
- `OpenLayersExportOptions` type with `features`, `projection`, `filter`, `pretty` fields.
- `PdfMeta` type — plain data descriptor for consumer-side PDF generation (not a buffer).
- `RasterDrawInstruction` discriminated union on `type`: `"rect"`, `"path"`, `"circle"`, `"text"`.
- `RasterExportPlan` type with `canvasWidth`, `canvasHeight`, `background`, `instructions`, `format`, `quality` fields.
- All dependency types (`Artboard`, `SvgElement` variants, `GeoJsonFeature`, `Result<T>`) defined locally for standalone use.

### Added (06-02 — Export to SVG)
- `applyExportFilter` — shared filter utility applying 5 steps in fixed order.
  - Conservative behaviour: items without `id` / `layer` / geometry pass through.
- `exportToSvg` — serializes artboard + `SvgElement[]` to an SVG XML string.
  - All 9 element types serialized: `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `g`.
  - `SvgGroupElement` children serialized recursively.
  - `SvgColor` serialized: `hex`, `rgb`, `rgba`, `named`, `none`.
  - `SvgTransform` serialized to `transform="..."` attribute.
  - `xmlDeclaration` option prepends `<?xml version="1.0" encoding="UTF-8"?>`.
  - `pretty` option applies 2-space indentation.
  - Returns `{ success: false, error: { code: "empty-export" } }` when filter leaves no elements.

### Added (06-03 — Export to GeoJSON)
- `exportToGeoJson` — serializes `GeoJsonFeature[]` to a FeatureCollection JSON string.
  - `includeBbox` computes union bounding box across all feature geometries.
  - Omits `bbox` entirely when all features have `null` geometry.
  - `pretty` option applies 2-space indentation.
  - Returns `empty-export` error when filter leaves no features.

### Added (06-04 — Export to OpenLayers)
- `exportToOpenLayers` — wraps `exportToGeoJson` with OpenLayers-specific `crs` annotation.
  - `crs` field omitted for `EPSG:4326` (the GeoJSON default).
  - `crs` field added for any other projection: `{ type: "name", properties: { name: "<CRS>" } }`.
  - Errors from `exportToGeoJson` propagated unchanged.

### Added (06-05 — Export to PDF Meta)
- `exportToPdfMeta` — produces a `PdfMeta` descriptor for consumer PDF generation.
  - Page size constants: `A4`, `A3`, `Letter`, `Legal` (in PDF points).
  - Supports custom `{ width, height }` page size.
  - `landscape` orientation swaps `width` ↔ `height` when `width < height`.
  - `svgContent` generated via `exportToSvg` (no XML declaration).
  - `title` and `author` metadata passed through.
  - Propagates `exportToSvg` errors.

### Added (06-06 — Export to Raster Plan)
- `exportToRasterPlan` — converts artboard content to a `RasterExportPlan`.
  - Canvas dimensions: `Math.round(artboard.size.* * scale)`.
  - Default `scale` is `1`; supports fractional and retina scales.
  - Produces `"rect"`, `"circle"`, `"path"`, `"text"` instructions.
  - `SvgGroupElement` children flattened recursively.
  - `SvgLineElement`, `SvgPolylineElement`, `SvgPolygonElement` → `"path"` instructions.
  - `format: "jpeg"` → `quality: 0.92`; `format: "png"` → `quality: undefined`.
  - `background` defaults to `"#ffffff"`.
  - Returns `empty-export` error when filter leaves no elements.
  - Zero DOM dependency — no `HTMLCanvasElement` or canvas API used.

### Added (06-07 — Package Finalization)
- `help.md` — complete API documentation with round-trip pairs, filter order, error codes, and raster consumer canvas example.
- `CHANGELOG.md` — this file.
- `README.md` — npm display page.
- Full test suite: `filter.test.ts`, `exportToSvg.test.ts`, `exportToGeoJson.test.ts`, `exportToOpenLayers.test.ts`, `exportToPdfMeta.test.ts`, `exportToRasterPlan.test.ts`.
- Public API exported from `src/index.ts`: `applyExportFilter`, `exportToSvg`, `exportToGeoJson`, `exportToOpenLayers`, `exportToPdfMeta`, `exportToRasterPlan`, and all types.
