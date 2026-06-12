# @komeilm76/km-exports

Serialization functions that convert artboard and map content into **SVG**, **GeoJSON**, **OpenLayers payloads**, **PDF metadata**, and **raster draw instructions**.

All functions are pure: data in, strings or structured objects out. **No file I/O, no HTTP, no canvas rendering, no DOM access** — you stay in control of where the output goes.

## Install

```bash
npm install @komeilm76/km-exports zod
# or
pnpm add @komeilm76/km-exports zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { exportToSvg, exportToGeoJson } from '@komeilm76/km-exports';

// Artboard + elements → SVG string
const svg = exportToSvg({ artboard, elements, pretty: true });
if (svg.success) {
  download('design.svg', svg.data); // "<?xml version=…><svg viewBox=…"
}

// Features → GeoJSON FeatureCollection string (with computed bbox)
const geo = exportToGeoJson({ features, includeBbox: true, pretty: true });
if (geo.success) {
  await fetch('/api/layers', { method: 'POST', body: geo.data });
}
```

## API

All exporters return `Result<T>` (`{ success: true, data }` or `{ success: false, error }`) — they never throw.

### `exportToSvg(options: SvgExportOptions): Result<string>`

| Option | Type | Default | Notes |
|---|---|---|---|
| `artboard` | `Artboard` | required | Defines the SVG `viewBox` |
| `elements` | `SvgElement[]` | required | Elements to serialize |
| `filter` | `ExportFilter` | — | Applied before serialization |
| `inlineAssets` | `boolean` | `false` | Inline referenced assets as base64 |
| `xmlDeclaration` | `boolean` | `true` | Prepend `<?xml …?>` |
| `pretty` | `boolean` | `false` | 2-space indentation |

### `exportToGeoJson(options: GeoJsonExportOptions): Result<string>`

| Option | Type | Default | Notes |
|---|---|---|---|
| `features` | `GeoJsonFeature[]` | required | Serialized into a FeatureCollection |
| `filter` | `ExportFilter` | — | Applied before serialization |
| `includeBbox` | `boolean` | `true` | Attach a collection-level `bbox` |
| `pretty` | `boolean` | `false` | 2-space indentation |

### `exportToOpenLayers(options: OpenLayersExportOptions): Result<string>`

Like `exportToGeoJson`, plus `projection` (default `"EPSG:4326"`). When the projection differs from the default, a legacy `crs` field is added so OpenLayers picks it up.

### `exportToPdfMeta(artboard, elements, options?): Result<PdfMeta>`

Produces a **descriptor** for your PDF library (jsPDF, PDFKit, pdfmake) — this package does *not* generate the PDF itself.

| Option | Type | Default |
|---|---|---|
| `pageSize` | `'A4' \| 'A3' \| 'letter' \| … \| { width, height }` (points) | `"A4"` |
| `orientation` | `'portrait' \| 'landscape'` | `"portrait"` |
| `title` / `author` | `string` | — |

```ts
import { jsPDF } from 'jspdf';

const meta = exportToPdfMeta(artboard, elements, { pageSize: 'A4', title: 'Site plan' });
if (meta.success) {
  const { pageSize, svgContent } = meta.data;
  const doc = new jsPDF({ format: [pageSize.width, pageSize.height] });
  doc.addSvgAsImage(svgContent, 0, 0, pageSize.width, pageSize.height);
}
```

### `exportToRasterPlan(artboard, elements, format, scale?, filter?): Result<RasterExportPlan>`

Produces an ordered list of canvas **draw instructions** (painter's algorithm) for PNG/JPEG rendering — again, no canvas API is touched here. `scale` is the pixel-density factor (e.g. `2` for retina, default `1`).

```ts
const plan = exportToRasterPlan(artboard, elements, 'png', 2);
if (plan.success) {
  const { canvasWidth, canvasHeight, background, instructions } = plan.data;
  const ctx = makeCanvas(canvasWidth, canvasHeight);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  for (const ins of instructions) {
    if (ins.type === 'rect')   { ctx.fillStyle = ins.fill; ctx.fillRect(ins.x, ins.y, ins.w, ins.h); }
    if (ins.type === 'path')   { ctx.fillStyle = ins.fill; ctx.fill(new Path2D(ins.d)); }
    if (ins.type === 'circle') { /* arc(ins.cx, ins.cy, ins.r, …) */ }
    if (ins.type === 'text')   { ctx.font = ins.font; ctx.fillText(ins.content, ins.x, ins.y); }
  }
}
```

### `applyExportFilter(items, filter?): T[]`

The filtering primitive used by all exporters — also exported for standalone use.

## Filtering — `ExportFilter`

Controls which elements/features are included. All fields optional; omit everything to pass all items through.

| Field | Type | Effect |
|---|---|---|
| `includeIds` | `string[]` | Keep only these ids |
| `excludeIds` | `string[]` | Drop these ids |
| `includeLayers` / `excludeLayers` | `string[]` | Match on the `layer` property |
| `boundingBox` | `[minX, minY, maxX, maxY]` | Keep items intersecting this **canvas-space** box |

## Types

Key exported types: `ExportFilter`, `SvgExportOptions`, `GeoJsonExportOptions`, `OpenLayersExportOptions`, `PdfMeta`, `RasterDrawInstruction` (discriminated on `type: 'rect' | 'path' | 'circle' | 'text'`), `RasterExportPlan`.

For convenience the package also re-exports the canonical types it consumes: `Result`/`ResultError` (km-shared), `Point`/`Size`/`Artboard` (km-artboard), all `Svg*` element types (km-svg), and the GeoJSON types (km-geojson) — here `GeoJsonFeature`/`GeoJsonFeatureCollection` are instantiated with nullable geometry/properties, as RFC 7946 allows.

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `exports` namespace |
| [`@komeilm76/km-imports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-imports) | The opposite direction — re-import what you exported |
| [`@komeilm76/km-svg`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-svg) / [`km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) / [`km-artboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-artboard) | The typed structures exporters consume |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-exports/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
