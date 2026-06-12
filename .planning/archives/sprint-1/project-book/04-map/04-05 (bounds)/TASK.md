# Page 04-05 — Bounds, Scale, and Layer Utilities

## Summary
Implements all bounding-box utilities (`boundsFromLatLngs`, `boundsCenter`,
`boundsContains`, `boundsIntersect`, `boundsExpand`, `boundsUnion`), scale
functions (`zoomToScale`, `scaleToZoom`, `metersPerPixel`), and layer format
helpers (`detectLayerFormat`, `makeGeoJsonSource`, `makeXyzSource`).

## Target
Three new files: `bounds.ts`, `scale.ts`, and `layers.ts`, all tested.

## Dependencies
- Page 04-02 (projection)

## Inputs
- `DT-Map.md` — specs for all 12 functions across bounds, scale, and layers.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-map/src/bounds.ts` | 6 bounding-box functions |
| `packages/km-map/src/scale.ts` | 3 scale/zoom functions |
| `packages/km-map/src/layers.ts` | 3 layer format helpers |
| `packages/km-map/tests/bounds.test.ts` | Tests |
| `packages/km-map/tests/scale.test.ts` | Tests |
| `packages/km-map/tests/layers.test.ts` | Tests |

## Step-by-Step Instructions

### `bounds.ts`
1. `boundsFromLatLngs(coords: LatLng[]): BoundingBox`:
   Walk the array and compute `[minLng, minLat, maxLng, maxLat]`.
2. `boundsCenter(bounds: BoundingBox): LatLng`:
   `{ lat: (south+north)/2, lng: (west+east)/2 }`.
3. `boundsContains(bounds: BoundingBox, point: LatLng): boolean` — inclusive.
4. `boundsIntersect(a: BoundingBox, b: BoundingBox): boolean` — axis-separation test.
5. `boundsExpand(bounds: BoundingBox, bufferDegrees: number): BoundingBox` — add buffer to all sides.
6. `boundsUnion(a: BoundingBox, b: BoundingBox): BoundingBox` — min/max of both.

### `scale.ts`
7. `zoomToScale(zoom: number): number` — scale denominator at equator, 96 DPI.
   Formula: `scale = (2^zoom * 256 * 96) / (2π * R * 100/2.54)`.
8. `scaleToZoom(scale: number): number` — inverse.
9. `metersPerPixel(zoom: number, lat: number): number`:
   `(2π * R * Math.cos(lat * π/180)) / (256 * 2^zoom)`.

### `layers.ts`
10. `detectLayerFormat(input: string): SupportedLayerFormat | "unknown"`:
    - Starts with `"<"` and contains `"svg"` → `"geojson"` (treat as SVG? No —
      return `"unknown"` unless it's actual GeoJSON or known format).
    - URL ends with `.geojson` or `.json` → `"geojson"`.
    - URL contains `/wms` or `SERVICE=WMS` → `"wms"`.
    - URL contains `/wmts` or `SERVICE=WMTS` → `"wmts"`.
    - URL contains `/{z}/{x}/{y}` → `"xyz"`.
    - Object with `type: "FeatureCollection"` → `"geojson"`.
    - Otherwise `"unknown"`.
11. `makeGeoJsonSource(data)` — returns `{ type: "geojson", data }`.
12. `makeXyzSource(url, tileSize?)` — returns `{ type: "raster", tiles: [url], tileSize: tileSize ?? 256 }`.

### Tests
Write tests for all 12 functions covering happy paths, edge cases, and
known-value checks. `boundsIntersect` must test touching edges (counts as intersection).

## Acceptance Criteria

- [x] All 12 functions implemented and exported from `index.ts`
- [x] `boundsContains` and `boundsIntersect` are inclusive on edges
- [x] `metersPerPixel` decreases as zoom increases
- [x] `detectLayerFormat` correctly identifies all known URL patterns
- [x] `makeGeoJsonSource` and `makeXyzSource` return correct plain objects
- [x] All tests pass, build clean

## Notes
- `makeGeoJsonSource` and `makeXyzSource` return plain objects compatible with
  MapLibre GL JS — but this library does NOT import MapLibre. The functions just
  produce the correct shape. Consumers wire these into their map libraries.
- `boundsExpand` with a negative buffer should clamp to a valid (non-inverted) box
  if the buffer exceeds the box size. Document this behavior.
