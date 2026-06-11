# Changelog — km-map

## [0.1.0] - 2026-06-11

### Added

**Types** (`src/types.ts`)
- `LatLng` — WGS84 geographic coordinate with JSDoc noting valid ranges
- `MercatorPoint` — Web Mercator (EPSG:3857) coordinate in meters
- `TileCoord` — XYZ slippy-map tile coordinate
- `PixelPoint` — global tile pixel space coordinate
- `BoundingBox` — `[west, south, east, north]` geographic bounding box tuple
- `SupportedLayerFormat` — 9-variant string literal union for layer format types

**Projections** (`src/projection.ts`)
- `latLngToMercator` — WGS84 → Web Mercator (EPSG:3857)
- `mercatorToLatLng` — Web Mercator → WGS84 (exact inverse)
- `latLngToPixel` — WGS84 → global pixel coordinates at a zoom level
- `pixelToLatLng` — pixel coordinates → WGS84 (exact inverse)

**Tiles** (`src/tiles.ts`)
- `latLngToTile` — geographic coordinate → XYZ tile at a zoom level
- `tileToBounds` — XYZ tile → geographic bounding box
- `tilesForBounds` — enumerate all tiles covering a bounding box
- `tileToQuadKey` — XYZ tile → Bing Maps quadkey string
- `quadKeyToTile` — Bing Maps quadkey → XYZ tile (`Result<TileCoord>`)

**Distance & Area** (`src/distance.ts`)
- `haversineDistance` — great-circle distance (meters) via Haversine formula
- `rhumbDistance` — constant-bearing (rhumb-line) distance in meters
- `bearing` — initial bearing in degrees (0–360, 0 = north)
- `destinationPoint` — destination given origin, bearing, distance
- `polygonArea` — area of a GeoJSON Polygon in square meters (handles holes)

**Bounds** (`src/bounds.ts`)
- `boundsFromLatLngs` — minimum bounding box from an array of coordinates
- `boundsCenter` — geographic center of a bounding box
- `boundsContains` — point-in-bounds test (inclusive on edges)
- `boundsIntersect` — box-intersection test (inclusive on touching edges)
- `boundsExpand` — grow or shrink a bounding box by a degree buffer
- `boundsUnion` — smallest box containing two bounding boxes

**Scale** (`src/scale.ts`)
- `zoomToScale` — zoom level → scale denominator at equator (96 DPI)
- `scaleToZoom` — scale denominator → zoom level (exact inverse)
- `metersPerPixel` — ground resolution in meters/pixel at a zoom and latitude

**Layers** (`src/layers.ts`)
- `detectLayerFormat` — heuristic URL/string → `SupportedLayerFormat | "unknown"`
- `makeGeoJsonSource` — MapLibre-compatible GeoJSON source object
- `makeXyzSource` — MapLibre-compatible raster XYZ source object
