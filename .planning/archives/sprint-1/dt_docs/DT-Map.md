# DT-Map

> Map coordinate math, projections, tile systems, distance calculations, and layer/format utilities.

---

## Overview

The map package is a collection of **pure mathematical and data functions** for working with geographic and tile-based map systems.

It does not render maps. It does not depend on MapLibre, Leaflet, OpenLayers, or any other map rendering library.  
It provides the **math and data structures** that any map rendering consumer needs:
- Coordinate transformations
- Projection conversions
- Tile address calculations
- Distance and area calculations
- Bounding box utilities
- Layer and source format helpers

---

## Coordinate Systems

### Geographic Coordinates (WGS84 / EPSG:4326)

```ts
type LatLng = {
  lat: number;   // Latitude  −90 to +90
  lng: number;   // Longitude −180 to +180
};
```

### Web Mercator (EPSG:3857)

```ts
type MercatorPoint = {
  x: number;   // meters east/west of prime meridian
  y: number;   // meters north/south of equator
};
```

### Tile Coordinates (XYZ)

```ts
type TileCoord = {
  x: number;   // tile column
  y: number;   // tile row
  z: number;   // zoom level (0–22)
};
```

### Screen/Pixel Coordinates

```ts
type PixelPoint = {
  x: number;   // pixels from left
  y: number;   // pixels from top
};
```

---

## Projection Functions

### `latLngToMercator`

Converts WGS84 geographic coordinates to Web Mercator (EPSG:3857) meters.

```ts
/**
 * Converts geographic (WGS84) coordinates to Web Mercator meters.
 *
 * @param latLng - Latitude/longitude in degrees.
 * @returns MercatorPoint in meters.
 */
function latLngToMercator(latLng: LatLng): MercatorPoint
```

### `mercatorToLatLng`

Reverse of `latLngToMercator`.

```ts
function mercatorToLatLng(point: MercatorPoint): LatLng
```

### `latLngToPixel`

Converts a geographic coordinate to pixel coordinates at a given zoom level (256px tiles).

```ts
/**
 * Converts a LatLng to global pixel coordinates at a specific zoom level.
 * Uses the standard Web Mercator / Google Maps tile scheme.
 *
 * @param latLng - Geographic coordinate.
 * @param zoom   - Zoom level (0–22).
 * @returns PixelPoint in the global tile pixel space.
 */
function latLngToPixel(latLng: LatLng, zoom: number): PixelPoint
```

### `pixelToLatLng`

```ts
function pixelToLatLng(pixel: PixelPoint, zoom: number): LatLng
```

---

## Tile Functions

### `latLngToTile`

Returns the tile containing a given coordinate at a given zoom level.

```ts
/**
 * Returns the XYZ tile coordinate for a geographic point at the given zoom level.
 *
 * @param latLng - Geographic coordinate.
 * @param zoom   - Zoom level (0–22).
 * @returns TileCoord (integer tile x, y, z).
 */
function latLngToTile(latLng: LatLng, zoom: number): TileCoord
```

### `tileToBounds`

Returns the geographic bounding box of a tile.

```ts
/**
 * Returns the geographic bounding box [west, south, east, north] of an XYZ tile.
 *
 * @param tile - Tile coordinate.
 * @returns [west, south, east, north] in degrees.
 */
function tileToBounds(tile: TileCoord): [number, number, number, number]
```

### `tilesForBounds`

Returns all tile coordinates at a given zoom that cover a bounding box.

```ts
/**
 * Returns all TileCoords at a given zoom level that intersect a bounding box.
 *
 * @param bounds - [west, south, east, north] in degrees.
 * @param zoom   - Zoom level.
 * @returns TileCoord[] — may be a large array at high zoom levels.
 */
function tilesForBounds(
  bounds: [number, number, number, number],
  zoom: number
): TileCoord[]
```

### `tileToQuadKey`

Converts an XYZ tile to a Bing Maps quadkey string.

```ts
function tileToQuadKey(tile: TileCoord): string
```

### `quadKeyToTile`

```ts
function quadKeyToTile(quadKey: string): Result<TileCoord>
```

---

## Distance and Area

### `haversineDistance`

Calculates the great-circle distance between two geographic points using the Haversine formula.

```ts
/**
 * Calculates the great-circle distance between two geographic points.
 *
 * @param from - Starting point.
 * @param to   - Ending point.
 * @returns Distance in meters.
 *
 * @example
 * haversineDistance({ lat: 51.5, lng: -0.12 }, { lat: 48.85, lng: 2.35 }) // ≈ 340,000
 */
function haversineDistance(from: LatLng, to: LatLng): number
```

### `rhumbDistance`

Calculates rhumb-line (constant bearing) distance.

```ts
function rhumbDistance(from: LatLng, to: LatLng): number
```

### `bearing`

Calculates the initial bearing from one point to another (0° = north, clockwise).

```ts
/**
 * Calculates the initial bearing from `from` to `to`.
 *
 * @returns Bearing in degrees (0–360).
 */
function bearing(from: LatLng, to: LatLng): number
```

### `destinationPoint`

Given a starting point, bearing, and distance, returns the destination.

```ts
/**
 * Returns the destination point given a start, bearing, and distance.
 *
 * @param origin   - Starting geographic coordinate.
 * @param bearing  - Bearing in degrees (0 = north, clockwise).
 * @param distance - Distance in meters.
 * @returns Destination LatLng.
 */
function destinationPoint(origin: LatLng, bearing: number, distance: number): LatLng
```

### `polygonArea`

Calculates the approximate area of a GeoJSON Polygon in square meters.

```ts
/**
 * Approximates the area of a geographic polygon.
 * Uses the spherical excess formula for small polygons; accurate for typical map regions.
 *
 * @param polygon - GeoJSON Polygon geometry.
 * @returns Area in square meters.
 */
function polygonArea(polygon: GeoJsonPolygon): number
```

---

## Bounding Box Utilities

### `BoundingBox`

```ts
/** [west, south, east, north] in degrees */
type BoundingBox = [number, number, number, number];
```

### `boundsFromLatLngs`

```ts
/**
 * Computes the minimum bounding box that contains all given coordinates.
 */
function boundsFromLatLngs(coords: LatLng[]): BoundingBox
```

### `boundsCenter`

```ts
/**
 * Returns the geographic center of a bounding box.
 */
function boundsCenter(bounds: BoundingBox): LatLng
```

### `boundsContains`

```ts
function boundsContains(bounds: BoundingBox, point: LatLng): boolean
```

### `boundsIntersect`

```ts
function boundsIntersect(a: BoundingBox, b: BoundingBox): boolean
```

### `boundsExpand`

```ts
/**
 * Expands a bounding box by a buffer in degrees.
 */
function boundsExpand(bounds: BoundingBox, bufferDegrees: number): BoundingBox
```

### `boundsUnion`

```ts
/**
 * Returns the smallest bounding box that contains both input boxes.
 */
function boundsUnion(a: BoundingBox, b: BoundingBox): BoundingBox
```

---

## Scale and Zoom

### `zoomToScale`

Converts a zoom level to a map scale denominator (at the equator, 96 DPI).

```ts
function zoomToScale(zoom: number): number
```

### `scaleToZoom`

```ts
function scaleToZoom(scale: number): number
```

### `metersPerPixel`

Returns the ground resolution (meters per pixel) at a given zoom and latitude.

```ts
/**
 * @param zoom    - Zoom level.
 * @param lat     - Latitude in degrees (ground resolution varies with latitude).
 * @returns Meters per pixel.
 */
function metersPerPixel(zoom: number, lat: number): number
```

---

## Layer Format Utilities

### `SupportedLayerFormat`

```ts
type SupportedLayerFormat =
  | "geojson"
  | "mvt"          // Mapbox Vector Tile
  | "wms"          // Web Map Service
  | "wmts"         // Web Map Tile Service
  | "xyz"          // XYZ raster tiles
  | "tms"          // Tile Map Service (y-flipped)
  | "openlayers"   // OpenLayers vector source JSON
  | "kml"          // KML (import only)
  | "gpx";         // GPX (import only)
```

### `detectLayerFormat`

```ts
/**
 * Heuristically detects the format of a layer source URL or data string.
 *
 * @param input - URL string or raw data string.
 * @returns SupportedLayerFormat or "unknown".
 */
function detectLayerFormat(input: string): SupportedLayerFormat | "unknown"
```

---

## MapLibre Helpers

These utilities produce configuration objects compatible with **MapLibre GL JS** sources and layers.  
They do not import MapLibre — they return plain objects that conform to its expected shape.

### `makeGeoJsonSource`

```ts
/**
 * Produces a MapLibre GeoJSON source object.
 *
 * @param data - GeoJSON FeatureCollection or URL string.
 * @returns A MapLibre-compatible source object `{ type: "geojson", data }`.
 */
function makeGeoJsonSource(data: GeoJsonFeatureCollection | string): {
  type: "geojson";
  data: GeoJsonFeatureCollection | string;
}
```

### `makeXyzSource`

```ts
/**
 * Produces a MapLibre raster source from an XYZ tile URL template.
 *
 * @param url   - Tile URL template, e.g. "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
 * @param tiles - Override tile size. @default 256
 */
function makeXyzSource(url: string, tileSize?: 256 | 512): {
  type: "raster";
  tiles: string[];
  tileSize: number;
}
```

---

## File Location

```
packages/
  map/
    src/
      types.ts              ← LatLng, MercatorPoint, TileCoord, BoundingBox, etc.
      schemas.ts
      projection.ts         ← latLngToMercator, mercatorToLatLng, etc.
      tiles.ts              ← latLngToTile, tileToBounds, tilesForBounds, etc.
      distance.ts           ← haversineDistance, bearing, destinationPoint, etc.
      bounds.ts             ← boundsFromLatLngs, boundsCenter, boundsIntersect, etc.
      scale.ts              ← zoomToScale, metersPerPixel, etc.
      layers.ts             ← detectLayerFormat, makeGeoJsonSource, makeXyzSource
      index.ts
    tests/
    help.md
```
