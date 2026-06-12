# Features (ideas — not yet committed)

> Source: project-evaluation ch. 06 (archived → `archives/sprint-1/project-evaluation/06-future-capacities/`). Promote to backlog when chosen.

## Tier 1 — direct extensions (architecture already supports them)

| ID | Feature | Status | Notes |
|---|---|---|---|
| F-001 | Format importers: KML / GPX / TopoJSON / WKT / shapefile (read) | 🔄 | WKT promoted → tasks.md T-021; `importAuto` + `ImportResult` warning model designed for this; each format = one module + registry entry |
| F-002 | Figma REST adapter (`km-figma`) | ⏳ | Archived `DT-Figma.md` already maps Figma node JSON → project types; mostly transcription |
| F-003 | Map-engine adapters: `km-adapter-openlayers` / `-maplibre` / `-leaflet` | ⏳ | Thin layers; engines are peer deps of adapter packages only (rule 8) |
| F-004 | Raster-plan executor reference impl (node-canvas / OffscreenCanvas → PNG) | ⏳ | km-exports already emits renderer-agnostic plans |
| F-005 | Plugin ecosystem activation — ship F-001 importers *as plugins* | 🔄 | Pattern validated by T-021; Registry + semver resolver built and tested but has no real plugins |

**Sequencing (evaluation recommendation):** formats-as-plugins first (small, widen the user funnel), adapters second (remove the "how do I see it on a map?" barrier), defer Tier 3 until downloads/users indicate pull.

## Tier 2 — operational deployment spaces (consumer directions, not package work)

| Space | Fit |
|---|---|
| Server-side geo pipelines (Node/Bun/edge) | Pure functions, JSON I/O → Workers/Lambda validate-transform-export APIs; `Result<T>` maps to HTTP errors |
| Web map annotation/editor tools | Artboard + snap + bounds + projection = "draw on map, export clean GeoJSON/SVG" core |
| Floor-plan / CAD georeferencing | `SvgGeoMeta` + `svgDocumentToFeatureCollection` → indoor mapping / BIM-lite |
| Cartographic print/PDF workflows | `exportToPdfMeta` + SVG export → field maps, report atlases |
| Tile prefetch / offline planning | `tilesForBounds` + quadkey math → offline-map bundlers, cache warmers |
| Education & GIS tooling | Small pure functions + planned Sandpack docs = teaching material |

## Tier 3 — strategic options (choose at most ONE, only after v1.0)

1. Hosted converter service — import/export matrix as web API + UI; monetizable, modest ops.
2. Figma plugin product — "export Figma frames as georeferenced SVG/GeoJSON"; DT-Figma is half the spec.
3. The geo-whiteboard — artboards over basemaps, collaborative annotation; largest build, only after adapters + playground have users.
