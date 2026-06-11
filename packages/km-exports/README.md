# km-exports

Serialization functions for converting artboard and map content into SVG, GeoJSON, OpenLayers JSON, PDF metadata, and raster draw instructions.

All functions are **pure** — no file I/O, no HTTP, no DOM, no canvas rendering.

## Install

```bash
npm install @komeilm76/km-exports
```

## Quick Start

```ts
import {
  exportToSvg,
  exportToGeoJson,
  exportToOpenLayers,
  exportToPdfMeta,
  exportToRasterPlan,
  applyExportFilter,
} from '@komeilm76/km-exports';

// Export to SVG
const svgResult = exportToSvg({ artboard, elements, pretty: true });
if (svgResult.success) console.log(svgResult.data);

// Export to GeoJSON
const geoResult = exportToGeoJson({ features, includeBbox: true });
if (geoResult.success) console.log(JSON.parse(geoResult.data).type); // "FeatureCollection"

// Export for OpenLayers (adds CRS for non-EPSG:4326 projections)
const olResult = exportToOpenLayers({ features, projection: 'EPSG:3857' });

// Export PDF metadata
const pdfResult = exportToPdfMeta(artboard, elements, { pageSize: 'A4', orientation: 'landscape' });
if (pdfResult.success) {
  // pass pdfResult.data to jsPDF / PDFKit / pdfmake
}

// Export raster plan (consumer executes with canvas API)
const rasterResult = exportToRasterPlan(artboard, elements, 'png', 2 /* 2× retina */);
```

## Documentation

See [help.md](./help.md) for the full API reference including filter order, round-trip pairs, and error codes.

## Error Codes

| Code | Description |
|---|---|
| `empty-export` | All content was filtered out — nothing to export |
| `invalid-artboard` | Artboard failed validation |
| `invalid-elements` | One or more SVG elements failed validation |
| `invalid-features` | One or more GeoJSON features failed validation |
| `unsupported-element` | Element type not supported in this export format |

## License

MIT
