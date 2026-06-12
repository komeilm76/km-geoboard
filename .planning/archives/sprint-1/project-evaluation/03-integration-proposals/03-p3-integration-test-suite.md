# P3. Integration test suite (the missing connective tissue)

Create `packages/km-geoboard/tests/integration/` covering the contracts the DT docs
promise but nothing currently verifies:

| Round-trip | Packages exercised |
|---|---|
| SVG string → `parseSvgDocument` → `svgDocumentToFeatureCollection` → `exportToSvg` → reparse, geometry preserved | svg, geojson, exports |
| GeoJSON → `importGeoJson` → `exportToGeoJson` → `importGeoJson`, deep-equal | imports, exports, geojson |
| Artboard → snapshot export → `importArtboardSnapshot`, deep-equal | artboard, imports, exports |
| `latLngToTile` → `tileToBounds` → contains original point | map |
| `importAuto` correctly routes all 4 formats incl. malformed input | imports + all |
| Plugin registry loading a plugin that wraps an importer | plugins + imports |

These tests are the operational definition of "the packages are connected."
DT-Inputs-and-Outputs' reversibility table is effectively a ready-made test plan.
