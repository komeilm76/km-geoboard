# km-map

## Overview

Pure coordinate math and geographic utilities. No map renderer required. Works in Node.js, browser, and edge runtimes.

This package provides everything a map application needs before it touches a renderer: coordinate transformations, tile math, distance and area calculations, bounding-box utilities, scale conversions, and layer source helpers. It has no dependency on MapLibre, Leaflet, OpenLayers, or any rendering library.

## Installation

```bash
npm install km-map
```

---

## Coordinate Systems

### WGS84 / Geographic (EPSG:4326)

The standard GPS coordinate system. Latitude runs from −90° (south pole) to +90° (north pole); longitude from −180° to +180°. Used by all inputs and outputs in this library unless noted otherwise.

### Web Mercator (EPSG:3857)

A cylindrical map projection that projects the sphere onto a flat plane. Distances are in meters from the prime meridian (x) and equator (y). Used internally and exposed via `latLngToMercator` / `mercatorToLatLng`. Clips at approximately ±85.0511° latitude.

### Tile XYZ Coordinates

The slippy-map tile scheme used by OpenStreetMap, Google Maps, Mapbox, and most web map libraries. At zoom level `z` the world is divided into a `2^z × 2^z` grid of tiles. Each tile is 256 × 256 pixels. `x` is the column (left = 0), `y` is the row (top = 0).

### Pixel Coordinates

At zoom level `z` the global pixel space is `(256 × 2^z) × (256 × 2^z)` pixels. Origin `(0, 0)` is the top-left (northwest) corner of the world. Divide pixel coordinates by 256 to get tile indices.

---

## Functions

### Projections

#### `latLngToMercator(latLng: LatLng): MercatorPoint`

Converts WGS84 geographic coordinates to Web Mercator (EPSG:3857) meters.

| Parameter | Type     | Required | Description                      |
|-----------|----------|----------|----------------------------------|
| `latLng`  | `LatLng` | yes      | Latitude/longitude in degrees    |

Returns `MercatorPoint` — `{ x, y }` in meters.

```ts
latLngToMercator({ lat: 0, lng: 0 }); // { x: 0, y: 0 }
latLngToMercator({ lat: 51.5074, lng: -0.1276 }); // { x: -14214.6, y: 6711531.8 }
```

---

#### `mercatorToLatLng(point: MercatorPoint): LatLng`

Reverse of `latLngToMercator`. Round-trip invariant: `mercatorToLatLng(latLngToMercator(p)) ≈ p`.

| Parameter | Type            | Required | Description                 |
|-----------|-----------------|----------|-----------------------------|
| `point`   | `MercatorPoint` | yes      | Mercator point in meters    |

Returns `LatLng` in degrees.

```ts
mercatorToLatLng({ x: 0, y: 0 }); // { lat: 0, lng: 0 }
```

---

#### `latLngToPixel(latLng: LatLng, zoom: number): PixelPoint`

Converts a WGS84 coordinate to global pixel coordinates at a given zoom level.

| Parameter | Type     | Required | Description               |
|-----------|----------|----------|---------------------------|
| `latLng`  | `LatLng` | yes      | Geographic coordinate     |
| `zoom`    | `number` | yes      | Zoom level (integer 0–22) |

Returns `PixelPoint` — `{ x, y }` in the global tile pixel space.

```ts
latLngToPixel({ lat: 0, lng: 0 }, 0); // { x: 128, y: 128 }
latLngToPixel({ lat: 0, lng: 0 }, 1); // { x: 256, y: 256 }
```

---

#### `pixelToLatLng(pixel: PixelPoint, zoom: number): LatLng`

Reverse of `latLngToPixel`. Round-trip invariant: `pixelToLatLng(latLngToPixel(p, z), z) ≈ p`.

| Parameter | Type         | Required | Description                                  |
|-----------|--------------|----------|----------------------------------------------|
| `pixel`   | `PixelPoint` | yes      | Pixel point in the global tile pixel space   |
| `zoom`    | `number`     | yes      | Zoom level matching the encoding             |

Returns `LatLng` in degrees.

```ts
pixelToLatLng({ x: 128, y: 128 }, 0); // { lat: 0, lng: 0 }
```

---

### Tiles

#### `latLngToTile(latLng: LatLng, zoom: number): TileCoord`

Returns the XYZ tile coordinate containing the given geographic point at a zoom level.

| Parameter | Type     | Required | Description               |
|-----------|----------|----------|---------------------------|
| `latLng`  | `LatLng` | yes      | Geographic coordinate     |
| `zoom`    | `number` | yes      | Zoom level (integer 0–22) |

Returns `TileCoord` — `{ x, y, z }` with integer tile indices.

```ts
latLngToTile({ lat: 0, lng: 0 }, 0);  // { x: 0, y: 0, z: 0 }
latLngToTile({ lat: 51.5074, lng: -0.1276 }, 10); // { x: 511, y: 340, z: 10 }
```

---

#### `tileToBounds(tile: TileCoord): BoundingBox`

Returns the geographic bounding box `[west, south, east, north]` of an XYZ tile.

| Parameter | Type        | Required | Description      |
|-----------|-------------|----------|------------------|
| `tile`    | `TileCoord` | yes      | Tile coordinate  |

Returns `BoundingBox` as `[west, south, east, north]` in degrees.

```ts
tileToBounds({ x: 0, y: 0, z: 0 }); // ≈ [-180, -85.05, 180, 85.05]
```

---

#### `tilesForBounds(bounds: BoundingBox, zoom: number): TileCoord[]`

Returns all tile coordinates at the given zoom that intersect a bounding box.

⚠️ At zoom 18+, this can return thousands of tiles. Always validate the expected count before use.

| Parameter | Type          | Required | Description                          |
|-----------|---------------|----------|--------------------------------------|
| `bounds`  | `BoundingBox` | yes      | `[west, south, east, north]` degrees |
| `zoom`    | `number`      | yes      | Zoom level (integer 0–22)            |

Returns `TileCoord[]`.

```ts
tilesForBounds([-180, -85.05, 180, 85.05], 0); // [{ x: 0, y: 0, z: 0 }]
tilesForBounds([-180, -85.05, 180, 85.05], 1); // 4 tiles
```

---

#### `tileToQuadKey(tile: TileCoord): string`

Converts an XYZ tile to a Bing Maps quadkey string. String length equals the zoom level.

| Parameter | Type        | Required | Description      |
|-----------|-------------|----------|------------------|
| `tile`    | `TileCoord` | yes      | Tile coordinate  |

Returns `string` — digits `0`–`3` only.

```ts
tileToQuadKey({ x: 0, y: 0, z: 0 }); // ""
tileToQuadKey({ x: 1, y: 1, z: 1 }); // "3"
```

---

#### `quadKeyToTile(quadKey: string): Result<TileCoord>`

Converts a Bing Maps quadkey back to an XYZ tile coordinate.

| Parameter  | Type     | Required | Description                          |
|------------|----------|----------|--------------------------------------|
| `quadKey`  | `string` | yes      | Quadkey (digits `0`–`3`, any length) |

Returns `Result<TileCoord>` — success with tile or failure with error code.

```ts
quadKeyToTile("");    // { success: true, data: { x: 0, y: 0, z: 0 } }
quadKeyToTile("3");  // { success: true, data: { x: 1, y: 1, z: 1 } }
quadKeyToTile("4");  // { success: false, error: { code: "invalid-quadkey", ... } }
```

---

### Distance & Area

#### `haversineDistance(from: LatLng, to: LatLng): number`

Calculates the great-circle distance between two points using the Haversine formula.

| Parameter | Type     | Required | Description      |
|-----------|----------|----------|------------------|
| `from`    | `LatLng` | yes      | Starting point   |
| `to`      | `LatLng` | yes      | Ending point     |

Returns distance in meters.

```ts
haversineDistance({ lat: 51.5074, lng: -0.1276 }, { lat: 48.8566, lng: 2.3522 }); // ≈ 340,000 m
haversineDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }); // 0
```

---

#### `rhumbDistance(from: LatLng, to: LatLng): number`

Calculates the rhumb-line (constant bearing) distance between two points.

| Parameter | Type     | Required | Description      |
|-----------|----------|----------|------------------|
| `from`    | `LatLng` | yes      | Starting point   |
| `to`      | `LatLng` | yes      | Ending point     |

Returns distance in meters.

```ts
rhumbDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 90 }); // ≈ 10,007,543 m
```

---

#### `bearing(from: LatLng, to: LatLng): number`

Calculates the initial bearing from one point to another (0° = north, clockwise).

| Parameter | Type     | Required | Description         |
|-----------|----------|----------|---------------------|
| `from`    | `LatLng` | yes      | Starting point      |
| `to`      | `LatLng` | yes      | Destination point   |

Returns bearing in degrees (0–360).

```ts
bearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }); // ≈ 0 (due north)
bearing({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }); // ≈ 90 (due east)
```

---

#### `destinationPoint(origin: LatLng, bearing: number, distance: number): LatLng`

Returns the destination point when travelling from an origin at a given bearing for a given distance.

| Parameter  | Type     | Required | Description                            |
|------------|----------|----------|----------------------------------------|
| `origin`   | `LatLng` | yes      | Starting point                         |
| `bearing`  | `number` | yes      | Initial bearing in degrees (0 = north) |
| `distance` | `number` | yes      | Distance in meters                     |

Returns `LatLng` destination.

```ts
destinationPoint({ lat: 0, lng: 0 }, 0, 111_195); // ≈ { lat: 1, lng: 0 }
```

---

#### `polygonArea(polygon: GeoJsonPolygon): number`

Approximates the area of a GeoJSON Polygon in square meters using the spherical excess formula. Handles polygons with holes.

| Parameter  | Type             | Required | Description         |
|------------|------------------|----------|---------------------|
| `polygon`  | `GeoJsonPolygon` | yes      | GeoJSON Polygon     |

Returns area in square meters (always positive).

```ts
polygonArea({
  type: 'Polygon',
  coordinates: [[[0,0],[1,0],[1,1],[0,1],[0,0]]],
}); // ≈ 12,308,000,000 m² (≈ 12,300 km²)
```

---

### Bounds

#### `boundsFromLatLngs(coords: LatLng[]): BoundingBox`

Computes the minimum bounding box containing all coordinates.

| Parameter | Type       | Required | Description                |
|-----------|------------|----------|----------------------------|
| `coords`  | `LatLng[]` | yes      | Non-empty array of points  |

Returns `BoundingBox` as `[west, south, east, north]`.

```ts
boundsFromLatLngs([{ lat: 51.5, lng: -0.1 }, { lat: 48.8, lng: 2.3 }]);
// [-0.1, 48.8, 2.3, 51.5]
```

---

#### `boundsCenter(bounds: BoundingBox): LatLng`

Returns the geographic center of a bounding box.

```ts
boundsCenter([-10, -10, 10, 10]); // { lat: 0, lng: 0 }
```

---

#### `boundsContains(bounds: BoundingBox, point: LatLng): boolean`

Returns `true` if the point lies within or on the boundary of the bounds (inclusive).

```ts
boundsContains([-10, -10, 10, 10], { lat: 0, lng: 0 });  // true
boundsContains([-10, -10, 10, 10], { lat: 11, lng: 0 }); // false
```

---

#### `boundsIntersect(a: BoundingBox, b: BoundingBox): boolean`

Returns `true` if the two bounding boxes overlap or touch at their edges (inclusive).

```ts
boundsIntersect([-10,-10,10,10], [5,5,20,20]);   // true (overlap)
boundsIntersect([-10,-10,10,10], [10,10,20,20]);  // true (touching corner)
boundsIntersect([-10,-10,10,10], [11,0,20,20]);   // false (separated)
```

---

#### `boundsExpand(bounds: BoundingBox, bufferDegrees: number): BoundingBox`

Expands or contracts a bounding box by a buffer amount in degrees on every side. Negative buffers shrink the box; if the buffer exceeds half the box size, the box collapses to its center point.

```ts
boundsExpand([0, 0, 10, 10], 1);  // [-1, -1, 11, 11]
boundsExpand([0, 0, 10, 10], -2); // [2, 2, 8, 8]
```

---

#### `boundsUnion(a: BoundingBox, b: BoundingBox): BoundingBox`

Returns the smallest bounding box containing both inputs.

```ts
boundsUnion([-10,-10,0,0], [0,0,10,10]); // [-10,-10,10,10]
```

---

### Scale

#### `zoomToScale(zoom: number): number`

Converts a zoom level to a map scale denominator at the equator (96 DPI, 256 px tiles).

```ts
zoomToScale(0);  // ≈ 559,082,264
zoomToScale(18); // ≈ 2,132
```

---

#### `scaleToZoom(scale: number): number`

Inverse of `zoomToScale`. Round-trip invariant: `scaleToZoom(zoomToScale(z)) ≈ z`.

```ts
scaleToZoom(559_082_264); // ≈ 0
```

---

#### `metersPerPixel(zoom: number, lat: number): number`

Returns the ground resolution in meters per pixel at the given zoom and latitude. Decreases as zoom increases or as latitude increases.

| Parameter | Type     | Required | Description                         |
|-----------|----------|----------|-------------------------------------|
| `zoom`    | `number` | yes      | Zoom level (0–22)                   |
| `lat`     | `number` | yes      | Latitude in degrees (0 = equator)   |

```ts
metersPerPixel(0, 0);    // ≈ 156,543 m/px
metersPerPixel(10, 0);   // ≈ 152 m/px
metersPerPixel(10, 51.5); // ≈ 95 m/px
```

---

### Layers

#### `detectLayerFormat(input: string): SupportedLayerFormat | "unknown"`

Heuristically detects the format of a layer source from a URL or data string.

| Parameter | Type     | Required | Description                      |
|-----------|----------|----------|----------------------------------|
| `input`   | `string` | yes      | URL or raw data string           |

Returns `SupportedLayerFormat` or `"unknown"`.

```ts
detectLayerFormat("https://example.com/data.geojson"); // "geojson"
detectLayerFormat("https://tile.example.com/{z}/{x}/{y}.png"); // "xyz"
detectLayerFormat("https://geo.example.com/wms?SERVICE=WMS"); // "wms"
detectLayerFormat("https://example.com/something"); // "unknown"
```

---

#### `makeGeoJsonSource(data): { type: "geojson"; data }`

Produces a MapLibre GL JS-compatible GeoJSON source object. Does not import MapLibre.

```ts
makeGeoJsonSource("https://example.com/data.geojson");
// { type: "geojson", data: "https://example.com/data.geojson" }
```

---

#### `makeXyzSource(url, tileSize?): { type: "raster"; tiles: string[]; tileSize: number }`

Produces a MapLibre GL JS-compatible raster source for XYZ tiles. Does not import MapLibre.

| Parameter   | Type           | Required | Default | Description                 |
|-------------|----------------|----------|---------|-----------------------------|
| `url`       | `string`       | yes      | —       | Tile URL template           |
| `tileSize`  | `256 \| 512`   | no       | `256`   | Tile size in pixels         |

```ts
makeXyzSource("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
// { type: "raster", tiles: ["https://..."], tileSize: 256 }
```

---

## Types

### `LatLng`

```ts
type LatLng = {
  lat: number; // −90 to +90
  lng: number; // −180 to +180
};
```

### `MercatorPoint`

```ts
type MercatorPoint = {
  x: number; // meters east/west of prime meridian
  y: number; // meters north/south of equator
};
```

### `TileCoord`

```ts
type TileCoord = {
  x: number; // tile column (integer)
  y: number; // tile row (integer)
  z: number; // zoom level (integer, 0–22)
};
```

### `PixelPoint`

```ts
type PixelPoint = {
  x: number; // pixels from left edge of world
  y: number; // pixels from top edge of world
};
```

### `BoundingBox`

```ts
/** [west, south, east, north] in WGS84 degrees */
type BoundingBox = [number, number, number, number];
```

### `SupportedLayerFormat`

```ts
type SupportedLayerFormat =
  | "geojson" | "mvt" | "wms" | "wmts"
  | "xyz" | "tms" | "openlayers" | "kml" | "gpx";
```

---

## Errors

Only `quadKeyToTile` returns a `Result` type and can fail.

| Error code        | When it occurs                                             |
|-------------------|------------------------------------------------------------|
| `invalid-quadkey` | The quadkey string contains a character other than 0–3.   |

```ts
const result = quadKeyToTile("4xyz");
// { success: false, error: { code: "invalid-quadkey", message: "...", field: "quadKey" } }
```
