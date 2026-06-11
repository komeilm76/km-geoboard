# km-exports

## Overview

Serialization functions that convert internal data structures into standard output formats: SVG, GeoJSON, OpenLayers JSON, PDF metadata, and raster draw instructions. All functions are pure — they receive data and return strings or structured objects. No file writes, no HTTP requests, no canvas rendering.

## Installation

```bash
npm install km-exports
```

## Quick Start

```ts
import { exportToSvg } from 'km-exports';

const result = exportToSvg({
  artboard,
  elements,
  xmlDeclaration: true,
  pretty: true,
});

if (result.success) {
  console.log(result.data); // "<svg viewBox="0 0 400 300" ..."
} else {
  console.error(result.error.code); // e.g. "empty-export"
}
```

---

## Functions

### `applyExportFilter(items, filter?)`

Applies an `ExportFilter` to an array of items.

**Filter Application Order** (5 fixed steps):

1. If `includeIds` is set and non-empty, keep only items whose `id` is in the set.
2. Remove items whose `id` is in `excludeIds`.
3. Keep only items whose `layer` matches `includeLayers` (if set and non-empty). Items with no `layer` property are kept conservatively.
4. Remove items whose `layer` matches `excludeLayers`. Items with no `layer` are kept conservatively.
5. Apply `boundingBox` — remove items that do not intersect the box. Items with no detectable geometry are kept conservatively.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `items` | `T[]` | ✅ | Array of items to filter. Must have an optional `id` field. |
| `filter` | `ExportFilter \| undefined` | — | Optional filter descriptor. Passing `undefined` returns items unchanged. |

**Output:** Filtered array (new array; original not mutated).

**Example:**
```ts
import { applyExportFilter } from 'km-exports';

const visible = applyExportFilter(elements, {
  includeIds: ['road-1', 'road-2'],
  excludeLayers: ['debug'],
});
```

---

### `exportToSvg(options)`

Serializes artboard content and SVG elements into an SVG XML string.

**Options:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `artboard` | `Artboard` | ✅ | — | Defines the `viewBox`, `width`, `height`. |
| `elements` | `SvgElement[]` | ✅ | — | Elements to serialize. |
| `filter` | `ExportFilter` | — | — | Optional filter applied before serialization. |
| `inlineAssets` | `boolean` | — | `false` | Inline referenced assets as base64. |
| `xmlDeclaration` | `boolean` | — | `true` | Prepend `<?xml version="1.0" encoding="UTF-8"?>`. |
| `pretty` | `boolean` | — | `false` | 2-space indentation. |

**Output:** `Result<string>` — the SVG string or an error.

**Example:**
```ts
const result = exportToSvg({ artboard, elements, pretty: true });
if (result.success) {
  fs.writeFileSync('output.svg', result.data, 'utf8');
}
```

---

### `exportToGeoJson(options)`

Serializes geographic features to a GeoJSON FeatureCollection string.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `features` | `GeoJsonFeature[]` | ✅ | — | Features to export. |
| `filter` | `ExportFilter` | — | — | Optional filter. |
| `includeBbox` | `boolean` | — | `true` | Compute and attach `bbox` to the collection. |
| `pretty` | `boolean` | — | `false` | 2-space indentation. |

**Output:** `Result<string>` — valid GeoJSON string or an error.

**Round-trip partner:** `importGeoJson` from `km-imports`.

**Example:**
```ts
const result = exportToGeoJson({ features, includeBbox: true });
if (result.success) {
  const parsed = JSON.parse(result.data);
  console.log(parsed.type); // "FeatureCollection"
}
```

---

### `exportToOpenLayers(options)`

Serializes features to an OpenLayers-compatible GeoJSON string, optionally adding a `crs` projection annotation.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `features` | `GeoJsonFeature[]` | ✅ | — | Features to export. |
| `projection` | `string` | — | `"EPSG:4326"` | CRS identifier. A `crs` field is added only when this differs from `"EPSG:4326"`. |
| `filter` | `ExportFilter` | — | — | Optional filter. |
| `pretty` | `boolean` | — | `false` | 2-space indentation. |

**CRS behavior:** For `EPSG:4326` (the GeoJSON standard), no `crs` annotation is added. For any other projection:
```json
{ "crs": { "type": "name", "properties": { "name": "EPSG:3857" } } }
```

**Round-trip partner:** `importOpenLayers` from `km-imports`.

**Example:**
```ts
const result = exportToOpenLayers({ features, projection: 'EPSG:3857' });
if (result.success) {
  const source = new VectorSource({ format: new GeoJSON() });
  source.addFeatures(new GeoJSON().readFeatures(JSON.parse(result.data)));
}
```

---

### `exportToPdfMeta(artboard, elements, options?)`

Produces a `PdfMeta` descriptor for consumer-side PDF generation using jsPDF, PDFKit, or pdfmake. **This function does not generate a PDF.**

**Page sizes (in PDF points — 1 pt = 1/72 inch):**

| Name | Width (pt) | Height (pt) |
|---|---|---|
| `A4` | 595.28 | 841.89 |
| `A3` | 841.89 | 1190.55 |
| `Letter` | 612 | 792 |
| `Legal` | 612 | 1008 |
| Custom | provided | provided |

**Options:**

| Field | Type | Default | Description |
|---|---|---|---|
| `pageSize` | `"A4" \| "A3" \| "Letter" \| "Legal" \| {width,height}` | `"A4"` | Page dimensions. |
| `orientation` | `"portrait" \| "landscape"` | `"portrait"` | Landscape swaps width ↔ height when width < height. |
| `title` | `string` | — | Document title metadata. |
| `author` | `string` | — | Document author metadata. |
| `filter` | `ExportFilter` | — | Element filter. |

**`PdfMeta` output:**

| Field | Type | Description |
|---|---|---|
| `pageSize` | `{width, height}` | Final page size in PDF points (orientation applied). |
| `orientation` | `"portrait" \| "landscape"` | Orientation used. |
| `svgContent` | `string` | Self-contained SVG string. `viewBox` uses artboard canvas units. |
| `artboard` | `Artboard` | Original artboard (for computing scale ratios). |
| `title` | `string \| undefined` | Document title. |
| `author` | `string \| undefined` | Document author. |

**Example:**
```ts
import jsPDF from 'jspdf';

const result = exportToPdfMeta(artboard, elements, { pageSize: 'A4', title: 'My Map' });
if (result.success) {
  const { pageSize, svgContent } = result.data;
  const doc = new jsPDF({ format: [pageSize.width, pageSize.height], unit: 'pt' });
  // jsPDF svg method handles the scaling from viewBox to page size
  doc.addSvgAsImage(svgContent, 0, 0, pageSize.width, pageSize.height);
  doc.save('map.pdf');
}
```

---

### `exportToRasterPlan(artboard, elements, format, scale?, filter?)`

Converts artboard content into a `RasterExportPlan` — ordered draw instructions for rendering to PNG or JPEG. **This function does not render to a canvas.**

**Instruction types:**

| `type` | Fields | Description |
|---|---|---|
| `"rect"` | `x, y, w, h, fill, stroke?, strokeWidth?` | Filled/stroked rectangle. |
| `"circle"` | `cx, cy, r, fill, stroke?` | Filled/stroked circle. |
| `"path"` | `d, fill, stroke?, strokeWidth?` | SVG path data string. |
| `"text"` | `x, y, content, font, fill` | Text drawn at a point. `font` is a CSS font string, e.g. `"14px Arial"`. |

**Consumer canvas example:**
```ts
const canvas = document.createElement('canvas');
canvas.width  = plan.canvasWidth;
canvas.height = plan.canvasHeight;
const ctx = canvas.getContext('2d')!;

// Fill background
ctx.fillStyle = plan.background;
ctx.fillRect(0, 0, plan.canvasWidth, plan.canvasHeight);

for (const instr of plan.instructions) {
  switch (instr.type) {
    case 'rect':
      ctx.fillStyle = instr.fill;
      ctx.fillRect(instr.x, instr.y, instr.w, instr.h);
      if (instr.stroke) {
        ctx.strokeStyle = instr.stroke;
        ctx.lineWidth   = instr.strokeWidth ?? 1;
        ctx.strokeRect(instr.x, instr.y, instr.w, instr.h);
      }
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(instr.cx, instr.cy, instr.r, 0, Math.PI * 2);
      ctx.fillStyle = instr.fill;
      ctx.fill();
      if (instr.stroke) { ctx.strokeStyle = instr.stroke; ctx.stroke(); }
      break;
    case 'path': {
      const path = new Path2D(instr.d);
      ctx.fillStyle = instr.fill;
      ctx.fill(path);
      if (instr.stroke) { ctx.strokeStyle = instr.stroke; ctx.stroke(path); }
      break;
    }
    case 'text':
      ctx.font      = instr.font;
      ctx.fillStyle = instr.fill;
      ctx.fillText(instr.content, instr.x, instr.y);
      break;
  }
}

// Export
const dataUrl = canvas.toDataURL(
  plan.format === 'jpeg' ? 'image/jpeg' : 'image/png',
  plan.quality,
);
```

---

## Round-Trip Pairs

| Export function | Import partner |
|---|---|
| `exportToSvg` | `importSvg` (from `km-imports`) |
| `exportToGeoJson` | `importGeoJson` (from `km-imports`) |
| `exportToOpenLayers` | `importOpenLayers` (from `km-imports`) |

`exportToPdfMeta` and `exportToRasterPlan` are one-way: PDF generation and canvas rendering are lossy/irreversible.

---

## Filter Application Order

Filters are applied in this fixed order across all export functions:

1. **includeIds** — if set and non-empty, keep only items whose `id` is in the set.
2. **excludeIds** — remove items whose `id` is in the set.
3. **includeLayers** — keep only items whose `layer` matches; items with no `layer` are kept conservatively.
4. **excludeLayers** — remove items whose `layer` matches; items with no `layer` are kept conservatively.
5. **boundingBox** — remove items that do not intersect `[minX, minY, maxX, maxY]`. Items with no detectable geometry are kept conservatively.

---

## Error Codes

| Code | Description |
|---|---|
| `invalid-artboard` | The artboard object failed validation |
| `invalid-elements` | One or more SVG elements failed validation |
| `invalid-features` | One or more GeoJSON features failed validation |
| `empty-export` | After applying filters, no content remains |
| `unsupported-element` | Element type not supported in this export format |

---

## Raster Export Notes

`exportToRasterPlan` is the only raster-related function in this library. It produces a `RasterExportPlan` — a plain data object containing ordered draw instructions. The consumer is responsible for executing these instructions using a canvas API (`CanvasRenderingContext2D` in a browser, or the `canvas` npm package in Node).

This design keeps the core library free of DOM and native bindings, making it isomorphic: the same code runs in Node and browser environments.

See the consumer canvas example in the `exportToRasterPlan` section above.
