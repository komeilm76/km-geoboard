# @komeilm76/km-map

Pure coordinate math and geographic utilities — Web Mercator projections, XYZ/quadkey tiles, geodesic distance and bearing, bounding boxes, scale, and layer-source helpers. **No map renderer required** — use it standalone or alongside OpenLayers, MapLibre, or Leaflet.

Works in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-map zod
# or
pnpm add @komeilm76/km-map zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import {
  latLngToTile, tileToBounds,
  haversineDistance, bearing, destinationPoint,
  boundsFromLatLngs, boundsContains,
  metersPerPixel,
} from '@komeilm76/km-map';

const london = { lat: 51.5074, lng: -0.1276 };
const paris  = { lat: 48.8566, lng:  2.3522 };

// Which tile is London on at zoom 12?
const tile = latLngToTile(london, 12);        // { x: 2044, y: 1362, z: 12 }
const tb   = tileToBounds(tile);              // [west, south, east, north]

// Great-circle distance & initial bearing
haversineDistance(london, paris);             // ≈ 343_550 meters
bearing(london, paris);                       // ≈ 148° (clockwise from north)

// Walk 1 km north-east from London
destinationPoint(london, 45, 1000);           // { lat: …, lng: … }

// Bounds
const box = boundsFromLatLngs([london, paris]);
boundsContains(box, { lat: 50, lng: 1 });     // true

// Ground resolution at zoom 15 at London's latitude
metersPerPixel(15, london.lat);               // ≈ 2.98 m/px
```

## API

### Projections (`Web Mercator / EPSG:3857`)

| Function | Signature | Description |
|---|---|---|
| `latLngToMercator` | `(latLng) => MercatorPoint` | WGS84 → meters |
| `mercatorToLatLng` | `(point) => LatLng` | meters → WGS84 |
| `latLngToPixel` | `(latLng, zoom) => PixelPoint` | WGS84 → global pixel space (`256·2^z` per side) |
| `pixelToLatLng` | `(pixel, zoom) => LatLng` | global pixel → WGS84 |

### Tiles (slippy-map XYZ + Bing quadkeys)

| Function | Signature | Description |
|---|---|---|
| `latLngToTile` | `(latLng, zoom) => TileCoord` | Which tile contains a coordinate |
| `tileToBounds` | `(tile) => BoundingBox` | Geographic extent of a tile |
| `tilesForBounds` | `(bounds, zoom) => TileCoord[]` | All tiles covering a region |
| `tileToQuadKey` | `(tile) => string` | XYZ → Bing quadkey |
| `quadKeyToTile` | `(quadKey) => Result<TileCoord>` | quadkey → XYZ (fails on invalid digits) |

### Distance & area (geodesic, meters)

| Function | Signature | Description |
|---|---|---|
| `haversineDistance` | `(from, to) => number` | Great-circle distance |
| `rhumbDistance` | `(from, to) => number` | Constant-bearing distance |
| `bearing` | `(from, to) => number` | Initial bearing, degrees clockwise from north |
| `destinationPoint` | `(origin, bearing, meters) => LatLng` | Point at distance along a bearing |
| `polygonArea` | `(polygon: GeoJsonPolygon) => number` | Spherical area in m² (holes subtracted) |

### Bounds (`[west, south, east, north]` in degrees)

| Function | Description |
|---|---|
| `boundsFromLatLngs(coords)` | Smallest box containing all coordinates |
| `boundsCenter(bounds)` | Center `LatLng` |
| `boundsContains(bounds, point)` | Point-in-box test (inclusive) |
| `boundsIntersect(a, b)` | Box overlap test |
| `boundsExpand(bounds, bufferDegrees)` | Grow a box outward |
| `boundsUnion(a, b)` | Smallest box containing both |

### Scale

| Function | Description |
|---|---|
| `zoomToScale(zoom)` | Zoom level → cartographic scale denominator (96 DPI) |
| `scaleToZoom(scale)` | Inverse of the above |
| `metersPerPixel(zoom, lat)` | Ground resolution at a latitude |

### Layers

| Function | Description |
|---|---|
| `detectLayerFormat(input)` | Guess `'geojson' \| 'mvt' \| 'xyz' \| …` from a URL/string |
| `makeGeoJsonSource(data)` | Build a renderer-agnostic GeoJSON source descriptor |
| `makeXyzSource(url, tileSize?)` | Build an XYZ raster tile source descriptor (`tileSize` 256 or 512, default 256) |

## Types

| Type | Shape | Notes |
|---|---|---|
| `LatLng` | `{ lat, lng }` | WGS84 degrees; lat −90…90, lng −180…180 |
| `MercatorPoint` | `{ x, y }` | EPSG:3857 meters |
| `TileCoord` | `{ x, y, z }` | XYZ scheme, z 0–22 |
| `PixelPoint` | `{ x, y }` | Global pixel space at a zoom |
| `BoundingBox` | `[west, south, east, north]` | ⚠️ Geographic order (lng first) — not the canvas `[minX, minY, maxX, maxY]` |
| `SupportedLayerFormat` | `'geojson' \| 'mvt' \| 'wms' \| 'wmts' \| 'xyz' \| 'tms' \| 'openlayers' \| 'kml' \| …` | Layer source formats |

## Error handling

Functions are pure and infallible where math allows; the few fallible ones (e.g. `quadKeyToTile`) return `Result<T>` from `@komeilm76/km-shared` instead of throwing.

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `map` namespace |
| [`@komeilm76/km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) | The GeoJSON types used by `polygonArea` and layer sources |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-map/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
