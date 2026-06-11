# Changelog — km-svg

All notable changes to this project are documented here.

---

## [0.1.0] — 2026-06-11

### Added

- **`types.ts`** — complete TypeScript type definitions:
  `SvgViewBox`, `SvgLengthUnit`, `SvgLength`, `SvgColor` (5 variants),
  `SvgTransformOperation` (6 variants), `SvgTransform`, `SvgPresentationAttributes` (16 fields),
  `SvgCoreAttributes`, all 9 element types (`SvgPathElement`, `SvgRectElement`,
  `SvgCircleElement`, `SvgEllipseElement`, `SvgLineElement`, `SvgPolylineElement`,
  `SvgPolygonElement`, `SvgTextElement`, `SvgGroupElement`), `SvgElement` union,
  `SvgPathCommand` (13 command variants), `SvgDocument`, `SvgGeoMeta`. No Zod imports.

- **`schemas.ts`** — Zod v4 schemas for all SVG types. Uses `z.lazy()` for recursive
  `SvgGroupElement.children`. Includes type-divergence guards for `SvgElement`,
  `SvgDocument`, `SvgViewBox`, `SvgLength`, `SvgColor`, `SvgTransformOperation`,
  `SvgTransform`, and `SvgGeoMeta`.

- **`parseSvgDocument`** — parse SVG XML string → `Result<SvgDocument>`.
  Uses `fast-xml-parser` (pure JS, no DOM). Handles `viewBox`, `width`, `height`,
  all 9 element types, nested `<g>` groups, `parseColor`, `parseTransform`,
  `parseLength`, `parseViewBox` helpers. Unsupported elements silently skipped.

- **`parseSvgPath`** — parse SVG path `d` attribute → `Result<SvgPathCommand[]>`.
  Supports all absolute and relative commands: M, L, H, V, C, S, Q, T, A, Z.
  Handles numbers separated by spaces, commas, or sign. Implicit repeated commands.

- **`serializeSvgPath`** — `SvgPathCommand[]` → `string`. Cannot fail.
  Round-trips correctly with `parseSvgPath`.

- **`svgPointToGeoPosition`** — linear interpolation from SVG canvas to `[lng, lat]`
  with Y-axis inversion.

- **`svgElementToGeoJsonFeature`** — converts all 9 SVG element types to the
  appropriate GeoJSON geometry. SVG presentation attributes stored in `Feature.properties`.

- **`svgDocumentToFeatureCollection`** — converts full `SvgDocument` to
  `GeoJsonFeatureCollection`. Does not abort on single-element failure.

- **`help.md`** — complete API documentation.
