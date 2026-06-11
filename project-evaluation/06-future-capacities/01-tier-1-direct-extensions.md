# Tier 1 — Direct extensions (the architecture already supports them)

| Capacity | Why it's near | Builds on |
|---|---|---|
| **More import/export formats: KML, GPX, TopoJSON, WKT, shapefile (read)** | `importAuto`/`detectImportFormat` and the `ImportResult` warning model were designed for exactly this; each format is one new module + registry entry | km-imports, km-exports |
| **Figma → GeoJSON/SVG bridge** | `DT-Figma.md` already maps Figma node JSON to project types and documents the REST endpoints; an adapter package (`km-figma`) is mostly transcription | km-svg, km-imports |
| **Raster export executor** | `exportToRasterPlan` already emits renderer-agnostic draw instructions; a reference executor for node-canvas / OffscreenCanvas turns plans into PNGs server-side | km-exports |
| **Map-engine adapter packages** (`km-adapter-openlayers`, `km-adapter-maplibre`, `km-adapter-leaflet`) | Thin translation layers; keeps the no-dependency rule by making engines peer deps of *adapter* packages only | km-map, km-geojson |
| **Plugin ecosystem activation** | The registry + semver dependency resolver is built and tested but has no real plugins; ship the format importers above *as plugins* to prove the system | km-plugins |
