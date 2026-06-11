/**
 * km-map — Type definitions for map coordinate systems and layer formats.
 *
 * This file contains ONLY type definitions — no Zod imports, no runtime code.
 * Zod schemas live in `schemas.ts`. This separation ensures declaration files
 * never carry a Zod import (see zod_hang.md).
 */

// ─── Coordinate Types ─────────────────────────────────────────────────────────

/**
 * A geographic coordinate in the WGS84 (EPSG:4326) datum.
 *
 * Valid ranges:
 * - `lat`: −90 to +90 (south pole to north pole)
 * - `lng`: −180 to +180 (west to east of prime meridian)
 *
 * @example
 * const london: LatLng = { lat: 51.5074, lng: -0.1276 };
 */
export type LatLng = {
  /** Latitude in degrees. Valid range: −90 to +90. */
  lat: number;
  /** Longitude in degrees. Valid range: −180 to +180. */
  lng: number;
};

/**
 * A point in the Web Mercator projection (EPSG:3857), measured in meters.
 *
 * - `x`: meters east (positive) or west (negative) of the prime meridian.
 * - `y`: meters north (positive) or south (negative) of the equator.
 *
 * @example
 * const origin: MercatorPoint = { x: 0, y: 0 }; // equator / prime meridian
 */
export type MercatorPoint = {
  /** Meters east/west of the prime meridian. */
  x: number;
  /** Meters north/south of the equator. */
  y: number;
};

/**
 * An XYZ tile coordinate as used by the slippy map tile scheme.
 *
 * - `x`: tile column (0 = leftmost at a given zoom).
 * - `y`: tile row (0 = topmost at a given zoom).
 * - `z`: zoom level (0–22).
 *
 * At zoom 0 there is a single tile covering the whole world: `{ x: 0, y: 0, z: 0 }`.
 *
 * @example
 * const worldTile: TileCoord = { x: 0, y: 0, z: 0 };
 */
export type TileCoord = {
  /** Tile column index (integer). */
  x: number;
  /** Tile row index (integer). */
  y: number;
  /** Zoom level (integer, 0–22). */
  z: number;
};

/**
 * A pixel coordinate in the global tile pixel space.
 *
 * At zoom level `z`, the global pixel space is `256 × 2^z` × `256 × 2^z` pixels.
 * Origin (0, 0) is the top-left corner of the world.
 *
 * @example
 * const center: PixelPoint = { x: 128, y: 128 }; // center at zoom 0
 */
export type PixelPoint = {
  /** Pixels from the left edge of the world at the current zoom level. */
  x: number;
  /** Pixels from the top edge of the world at the current zoom level. */
  y: number;
};

// ─── Geographic Utilities ─────────────────────────────────────────────────────

/**
 * A geographic bounding box in the WGS84 datum.
 *
 * Tuple order: `[west, south, east, north]` — this is the geographic/GeoJSON
 * convention (longitude first, latitude second).
 *
 * ⚠️ This differs from the artboard package's internal `[minX, minY, maxX, maxY]`
 * canvas convention. Both are 4-number tuples, but they represent different
 * coordinate systems. Always use JSDoc to be explicit.
 *
 * - `west`:  western-most longitude in degrees (−180 to +180)
 * - `south`: southern-most latitude in degrees (−90 to +90)
 * - `east`:  eastern-most longitude in degrees (−180 to +180)
 * - `north`: northern-most latitude in degrees (−90 to +90)
 *
 * @example
 * const world: BoundingBox = [-180, -85.0511, 180, 85.0511];
 */
export type BoundingBox = [
  /** west  — western-most longitude */
  number,
  /** south — southern-most latitude */
  number,
  /** east  — eastern-most longitude */
  number,
  /** north — northern-most latitude */
  number,
];

// ─── Layer Formats ────────────────────────────────────────────────────────────

/**
 * The set of map layer source formats supported by this library.
 *
 * | Value        | Description                                      |
 * |--------------|--------------------------------------------------|
 * | `"geojson"`  | GeoJSON FeatureCollection or file URL            |
 * | `"mvt"`      | Mapbox Vector Tile (protobuf binary)             |
 * | `"wms"`      | OGC Web Map Service                              |
 * | `"wmts"`     | OGC Web Map Tile Service                         |
 * | `"xyz"`      | XYZ raster tile URL template (`{z}/{x}/{y}`)     |
 * | `"tms"`      | Tile Map Service (y-axis flipped vs XYZ)         |
 * | `"openlayers"` | OpenLayers vector source JSON format           |
 * | `"kml"`      | KML (import only)                                |
 * | `"gpx"`      | GPX (import only)                                |
 */
export type SupportedLayerFormat =
  | 'geojson'
  | 'mvt'
  | 'wms'
  | 'wmts'
  | 'xyz'
  | 'tms'
  | 'openlayers'
  | 'kml'
  | 'gpx';
