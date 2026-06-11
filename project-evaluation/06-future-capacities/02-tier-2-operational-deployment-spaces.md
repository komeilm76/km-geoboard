# Tier 2 — Operational deployment spaces

| Space | Fit |
|---|---|
| **Server-side geo pipelines** (Node/Bun/edge) | Pure functions, no DOM, JSON-serializable I/O — drop into Cloudflare Workers or Lambda for validate-transform-export APIs; `Result<T>` maps cleanly to HTTP error responses |
| **Web map annotation/editor tools** | The artboard + snap + bounds + projection math is the core of a "draw on map, export clean GeoJSON/SVG" product; UI layer is the consumer's (or the playground grows into it) |
| **Floor-plan / CAD georeferencing** | `SvgGeoMeta` + `svgDocumentToFeatureCollection` is exactly the primitive for placing building plans on maps (facility management, indoor mapping, BIM-lite) |
| **Cartographic print/PDF workflows** | `exportToPdfMeta` + SVG export = map-to-print pipelines (field maps, report atlases) |
| **Tile prefetch / offline planning** | `tilesForBounds` + quadkey math serves offline-map bundlers and tile-cache warmers |
| **Education & GIS tooling** | Small pure functions with uniform contracts and runnable examples are ideal teaching material; the planned Sandpack docs make this nearly free |
