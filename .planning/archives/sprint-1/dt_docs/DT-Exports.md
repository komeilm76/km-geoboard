# DT-Exports

> Export pipeline — serializing artboard and map content to SVG, PNG, JPEG, GeoJSON, OpenLayers, and PDF metadata.

---

## Overview

The exports package provides **serialization functions** that convert internal data structures into standard output formats.  
Export functions are pure: they receive a data object and return a string or binary buffer.  
They do not write to disk, send HTTP requests, or trigger downloads — those are the consumer's responsibility.

Filters allow the caller to control which layers, elements, or features are included in the export.

---

## Supported Output Formats

| Format | Output Type | Use Case |
|---|---|---|
| `svg` | `string` | Vector graphics, web, print-ready |
| `geojson` | `string` (JSON) | Geographic data interchange |
| `openlayers` | `string` (JSON) | OpenLayers vector source format |
| `pdf-meta` | `PdfMeta` object | Metadata for consumer-side PDF generation |
| `png` | `Uint8Array` | Raster image (requires canvas environment) |
| `jpeg` | `Uint8Array` | Raster image (requires canvas environment) |

**Note on PNG/JPEG**: Rasterization requires a canvas context (browser `<canvas>` or Node `canvas` package).  
This library returns the canvas draw instructions as a structured `RasterExportPlan`; rendering is delegated to the consumer.  
This keeps the core library free of DOM and native bindings.

---

## Types

### `ExportFilter`

Controls which content is included in the export.

```ts
type ExportFilter = {
  /**
   * Only include features/elements with these IDs.
   * If empty or undefined, all items are included.
   */
  includeIds?: string[];

  /**
   * Exclude features/elements with these IDs.
   */
  excludeIds?: string[];

  /**
   * Only include items with these layer names.
   */
  includeLayers?: string[];

  /**
   * Exclude items with these layer names.
   */
  excludeLayers?: string[];

  /**
   * Bounding box filter [minX, minY, maxX, maxY].
   * Only items that intersect this box are included.
   * Coordinates are in the source coordinate system.
   */
  boundingBox?: [number, number, number, number];
};
```

### `SvgExportOptions`

```ts
type SvgExportOptions = {
  /**
   * The artboard or viewport to export.
   */
  artboard: Artboard;

  /**
   * SVG elements to include.
   */
  elements: SvgElement[];

  /**
   * Optional filter.
   */
  filter?: ExportFilter;

  /**
   * Whether to inline all referenced assets (fonts, linked images) as base64.
   * @default false
   */
  inlineAssets?: boolean;

  /**
   * Whether to include XML declaration at the top.
   * @default true
   */
  xmlDeclaration?: boolean;

  /**
   * Pretty-print the SVG output.
   * @default false
   */
  pretty?: boolean;
};
```

### `GeoJsonExportOptions`

```ts
type GeoJsonExportOptions = {
  /**
   * Features to export.
   */
  features: GeoJsonFeature[];

  /**
   * Optional filter.
   */
  filter?: ExportFilter;

  /**
   * Whether to include a `bbox` at the FeatureCollection level.
   * @default true
   */
  includeBbox?: boolean;

  /**
   * Pretty-print the JSON output.
   * @default false
   */
  pretty?: boolean;
};
```

### `OpenLayersExportOptions`

```ts
type OpenLayersExportOptions = {
  /**
   * Features to export as an OpenLayers vector source.
   * GeoJSON FeatureCollection is the standard format for ol/source/Vector.
   */
  features: GeoJsonFeature[];

  /**
   * Coordinate reference system for the output.
   * @default "EPSG:4326"
   */
  projection?: string;

  filter?: ExportFilter;
  pretty?: boolean;
};
```

### `PdfMeta`

The library does not generate PDFs directly.  
Instead, it produces a `PdfMeta` object that a consumer can pass to a PDF library (e.g., `jsPDF`, `PDFKit`, `pdfmake`).

```ts
type PdfMeta = {
  /**
   * Page size in points (1 pt = 1/72 inch).
   */
  pageSize: { width: number; height: number };

  /**
   * Page orientation.
   */
  orientation: "portrait" | "landscape";

  /**
   * SVG string for the page content, scaled to the page size.
   */
  svgContent: string;

  /**
   * Original artboard dimensions for reference.
   */
  artboard: Artboard;

  /**
   * Title metadata for the PDF document.
   */
  title?: string;

  /**
   * Author metadata.
   */
  author?: string;
};
```

### `RasterExportPlan`

Instructions for rasterizing to PNG or JPEG — consumer must execute these with a canvas.

```ts
type RasterDrawInstruction =
  | { type: "rect";   x: number; y: number; w: number; h: number; fill: string; stroke?: string; strokeWidth?: number }
  | { type: "path";   d: string; fill: string; stroke?: string; strokeWidth?: number }
  | { type: "circle"; cx: number; cy: number; r: number; fill: string; stroke?: string }
  | { type: "text";   x: number; y: number; content: string; font: string; fill: string };

type RasterExportPlan = {
  /**
   * Canvas dimensions in pixels.
   */
  canvasWidth: number;
  canvasHeight: number;

  /**
   * Background color.
   * @default "#ffffff"
   */
  background: string;

  /**
   * Ordered draw instructions (painter's algorithm — later items draw on top).
   */
  instructions: RasterDrawInstruction[];

  /**
   * Target format.
   */
  format: "png" | "jpeg";

  /**
   * JPEG quality (0–1). Only used when format is "jpeg".
   * @default 0.92
   */
  quality?: number;
};
```

---

## Functions

### `exportToSvg`

```ts
/**
 * Serializes artboard content to an SVG string.
 *
 * @param options - SVG export options including artboard and elements.
 * @returns Result with the SVG string or an error.
 *
 * @example
 * const result = exportToSvg({ artboard, elements, pretty: true });
 * if (result.success) console.log(result.data); // "<svg viewBox=..."
 */
function exportToSvg(options: SvgExportOptions): Result<string>
```

### `exportToGeoJson`

```ts
/**
 * Serializes geographic features to a GeoJSON FeatureCollection string.
 *
 * @param options - GeoJSON export options.
 * @returns Result with the JSON string.
 */
function exportToGeoJson(options: GeoJsonExportOptions): Result<string>
```

### `exportToOpenLayers`

```ts
/**
 * Serializes features to an OpenLayers-compatible GeoJSON string.
 * This is structurally identical to GeoJSON FeatureCollection but may include
 * OpenLayers-specific projection metadata.
 *
 * @param options - OpenLayers export options.
 * @returns Result with the JSON string.
 */
function exportToOpenLayers(options: OpenLayersExportOptions): Result<string>
```

### `exportToPdfMeta`

```ts
/**
 * Produces a PdfMeta object for consumer-side PDF generation.
 *
 * @param artboard - The artboard to export.
 * @param elements - SVG elements on the artboard.
 * @param options  - Page size, orientation, and metadata options.
 * @returns Result<PdfMeta>.
 */
function exportToPdfMeta(
  artboard: Artboard,
  elements: SvgElement[],
  options?: {
    /** @default "A4" */
    pageSize?: "A4" | "A3" | "Letter" | "Legal" | { width: number; height: number };
    /** @default "portrait" */
    orientation?: "portrait" | "landscape";
    title?: string;
    author?: string;
    filter?: ExportFilter;
  }
): Result<PdfMeta>
```

### `exportToRasterPlan`

```ts
/**
 * Produces a RasterExportPlan — draw instructions for rendering to PNG or JPEG.
 * The consumer must execute these instructions using a canvas API.
 *
 * @param artboard    - The artboard defining the canvas dimensions.
 * @param elements    - SVG elements to rasterize.
 * @param format      - "png" or "jpeg".
 * @param scale       - Scale factor (e.g., 2 for 2× retina). @default 1
 * @param filter      - Optional element filter.
 * @returns Result<RasterExportPlan>.
 */
function exportToRasterPlan(
  artboard: Artboard,
  elements: SvgElement[],
  format: "png" | "jpeg",
  scale?: number,
  filter?: ExportFilter
): Result<RasterExportPlan>
```

---

## Applying Filters

Filters are applied consistently across all export functions:

1. If `includeIds` is set, start with only those IDs.
2. Apply `excludeIds` — remove any matching.
3. Apply `includeLayers` — keep only items on those layers.
4. Apply `excludeLayers` — remove items on those layers.
5. Apply `boundingBox` — remove items that do not intersect.

---

## Error Codes

| Code | Description |
|---|---|
| `invalid-artboard` | The artboard object failed validation |
| `invalid-elements` | One or more SVG elements failed validation |
| `invalid-features` | One or more GeoJSON features failed validation |
| `empty-export` | After applying filters, no content remains |
| `unsupported-element` | An element type is not supported in this export format |

---

## File Location

```
packages/
  exports/
    src/
      types.ts
      schemas.ts
      filter.ts           ← applyExportFilter
      exportToSvg.ts
      exportToGeoJson.ts
      exportToOpenLayers.ts
      exportToPdfMeta.ts
      exportToRasterPlan.ts
      index.ts
    tests/
    help.md
```
