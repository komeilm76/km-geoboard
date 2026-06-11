/**
 * Tile coordinate functions — XYZ / TMS tile system math.
 *
 * All functions operate on integer tile coordinates in the standard
 * slippy-map (XYZ) tile scheme used by OpenStreetMap, Google Maps,
 * Mapbox, and most web map rendering libraries.
 */

import type { LatLng, TileCoord, BoundingBox } from './types';
import type { Result } from '@komeilm76/km-shared';
import { latLngToPixel, pixelToLatLng } from './projection';

// ─── latLngToTile ─────────────────────────────────────────────────────────────

/**
 * Returns the XYZ tile coordinate containing the given geographic point
 * at the specified zoom level.
 *
 * Tile indices are floored to integers and clamped to the valid range
 * `[0, 2^zoom − 1]` on each axis.
 *
 * At zoom 0 there is exactly one tile: `{ x: 0, y: 0, z: 0 }`.
 *
 * @param latLng - Geographic coordinate (WGS84).
 * @param zoom   - Zoom level (integer, 0–22).
 * @returns `TileCoord` — integer tile x, y, z.
 *
 * @example
 * latLngToTile({ lat: 0, lng: 0 }, 0); // { x: 0, y: 0, z: 0 }
 * latLngToTile({ lat: 51.5074, lng: -0.1276 }, 10); // { x: 511, y: 340, z: 10 }
 */
export function latLngToTile(latLng: LatLng, zoom: number): TileCoord {
  const pixel = latLngToPixel(latLng, zoom);
  const maxIndex = Math.pow(2, zoom) - 1;
  const x = Math.min(Math.max(Math.floor(pixel.x / 256), 0), maxIndex);
  const y = Math.min(Math.max(Math.floor(pixel.y / 256), 0), maxIndex);
  return { x, y, z: zoom };
}

// ─── tileToBounds ─────────────────────────────────────────────────────────────

/**
 * Returns the geographic bounding box `[west, south, east, north]` of an
 * XYZ tile in WGS84 degrees.
 *
 * @param tile - Tile coordinate.
 * @returns `[west, south, east, north]` in degrees.
 *
 * @example
 * tileToBounds({ x: 0, y: 0, z: 0 }); // ≈ [-180, -85.05, 180, 85.05]
 */
export function tileToBounds(tile: TileCoord): BoundingBox {
  const { x, y, z } = tile;
  // Northwest corner of the tile (pixel origin at top-left of tile)
  const nw = pixelToLatLng({ x: x * 256, y: y * 256 }, z);
  // Southeast corner (next tile's NW pixel, minus 1 — use next tile boundaries)
  const se = pixelToLatLng({ x: (x + 1) * 256, y: (y + 1) * 256 }, z);
  return [nw.lng, se.lat, se.lng, nw.lat];
}

// ─── tilesForBounds ───────────────────────────────────────────────────────────

/**
 * Returns all `TileCoord` values at the given zoom level whose geographic
 * extent intersects the provided bounding box.
 *
 * ⚠️ The result array can be **very large** at high zoom levels. At zoom 18
 * a bounding box covering a small city may return tens of thousands of tiles.
 * Always validate the expected tile count before calling this at high zooms.
 *
 * @param bounds - `[west, south, east, north]` in degrees.
 * @param zoom   - Zoom level (integer, 0–22).
 * @returns Array of `TileCoord` covering the bounds. May be large at high zoom.
 *
 * @example
 * tilesForBounds([-180, -85.05, 180, 85.05], 0); // [{ x: 0, y: 0, z: 0 }]
 */
export function tilesForBounds(bounds: BoundingBox, zoom: number): TileCoord[] {
  const [west, south, east, north] = bounds;
  const swTile = latLngToTile({ lat: south, lng: west }, zoom);
  const neTile = latLngToTile({ lat: north, lng: east }, zoom);

  const minX = Math.min(swTile.x, neTile.x);
  const maxX = Math.max(swTile.x, neTile.x);
  const minY = Math.min(swTile.y, neTile.y);
  const maxY = Math.max(swTile.y, neTile.y);

  const tiles: TileCoord[] = [];
  for (let tx = minX; tx <= maxX; tx++) {
    for (let ty = minY; ty <= maxY; ty++) {
      tiles.push({ x: tx, y: ty, z: zoom });
    }
  }
  return tiles;
}

// ─── tileToQuadKey ────────────────────────────────────────────────────────────

/**
 * Converts an XYZ tile coordinate to a Bing Maps quadkey string.
 *
 * A quadkey encodes the tile's path from the root of the tile pyramid.
 * Each character is `'0'`, `'1'`, `'2'`, or `'3'`, and the string length
 * equals the zoom level.
 *
 * @param tile - Tile coordinate.
 * @returns Quadkey string of length `tile.z`.
 *
 * @example
 * tileToQuadKey({ x: 0, y: 0, z: 0 }); // ""
 * tileToQuadKey({ x: 1, y: 1, z: 1 }); // "3"
 * tileToQuadKey({ x: 3, y: 5, z: 3 }); // "213"
 */
export function tileToQuadKey(tile: TileCoord): string {
  let quadKey = '';
  for (let i = tile.z; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((tile.x & mask) !== 0) digit += 1;
    if ((tile.y & mask) !== 0) digit += 2;
    quadKey += digit.toString();
  }
  return quadKey;
}

// ─── quadKeyToTile ────────────────────────────────────────────────────────────

/**
 * Converts a Bing Maps quadkey string back to an XYZ tile coordinate.
 *
 * Returns a `Result` — fails with code `"invalid-quadkey"` if the string
 * contains any character other than `'0'`, `'1'`, `'2'`, or `'3'`.
 *
 * @param quadKey - Quadkey string (digits 0–3 only). Empty string → zoom 0 tile.
 * @returns `Result<TileCoord>` — success with tile or failure with error code.
 *
 * @example
 * quadKeyToTile("");    // { success: true, data: { x: 0, y: 0, z: 0 } }
 * quadKeyToTile("3");  // { success: true, data: { x: 1, y: 1, z: 1 } }
 * quadKeyToTile("4");  // { success: false, error: { code: "invalid-quadkey", ... } }
 */
export function quadKeyToTile(quadKey: string): Result<TileCoord> {
  let x = 0;
  let y = 0;
  const z = quadKey.length;

  for (let i = z; i > 0; i--) {
    const mask = 1 << (i - 1);
    const charIndex = z - i;
    const char = quadKey[charIndex];

    switch (char) {
      case '0':
        break;
      case '1':
        x |= mask;
        break;
      case '2':
        y |= mask;
        break;
      case '3':
        x |= mask;
        y |= mask;
        break;
      default:
        return {
          success: false,
          error: {
            code: 'invalid-quadkey',
            message: `Invalid quadkey character '${char}' at position ${charIndex}. Valid characters are '0', '1', '2', '3'.`,
            field: 'quadKey',
          },
        };
    }
  }

  return { success: true, data: { x, y, z } };
}
