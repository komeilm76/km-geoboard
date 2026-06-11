/**
 * Map projection functions — WGS84 ↔ Web Mercator ↔ Pixel space.
 *
 * All functions are pure math. No external dependencies beyond the types file.
 *
 * ⚠️ Web Mercator clips latitude at approximately ±85.0511°. Inputs beyond this
 * range produce `Infinity` or `NaN`. These functions do not guard against invalid
 * latitudes — document expected ranges in calling code.
 */

import type { LatLng, MercatorPoint, PixelPoint } from './types';

/** WGS84 semi-major axis radius in meters. */
const R = 6378137;

// ─── Mercator ─────────────────────────────────────────────────────────────────

/**
 * Converts WGS84 geographic coordinates to Web Mercator (EPSG:3857) meters.
 *
 * Uses the standard spherical Mercator formula with the WGS84 earth radius.
 * Valid latitude range is approximately −85.0511° to +85.0511°; values outside
 * this range produce `Infinity`.
 *
 * @param latLng - Latitude/longitude in degrees.
 * @returns `MercatorPoint` in meters from the prime meridian / equator.
 *
 * @example
 * latLngToMercator({ lat: 0, lng: 0 }); // { x: 0, y: 0 }
 * latLngToMercator({ lat: 51.5074, lng: -0.1276 }); // { x: -14214.6, y: 6711531.8 }
 */
export function latLngToMercator(latLng: LatLng): MercatorPoint {
  const x = R * (latLng.lng * (Math.PI / 180));
  const y = R * Math.log(Math.tan(Math.PI / 4 + (latLng.lat * (Math.PI / 180)) / 2));
  return { x, y };
}

/**
 * Converts Web Mercator (EPSG:3857) meters back to WGS84 geographic coordinates.
 *
 * This is the exact inverse of `latLngToMercator`.
 * Round-trip invariant: `mercatorToLatLng(latLngToMercator(p)) ≈ p` for all
 * valid inputs (within floating-point precision).
 *
 * @param point - Mercator point in meters.
 * @returns `LatLng` in degrees.
 *
 * @example
 * mercatorToLatLng({ x: 0, y: 0 }); // { lat: 0, lng: 0 }
 */
export function mercatorToLatLng(point: MercatorPoint): LatLng {
  const lng = (point.x / R) * (180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(point.y / R)) - Math.PI / 2) * (180 / Math.PI);
  return { lat, lng };
}

// ─── Pixel Space ──────────────────────────────────────────────────────────────

/**
 * Converts a WGS84 coordinate to global pixel coordinates at a given zoom level.
 *
 * Uses the standard Web Mercator / slippy-map tile scheme. At zoom `z` the
 * global pixel space is `(256 × 2^z) × (256 × 2^z)` pixels. Origin `(0, 0)` is
 * the top-left corner of the world (northwest corner).
 *
 * @param latLng - Geographic coordinate.
 * @param zoom   - Zoom level (0–22). Must be a non-negative integer.
 * @returns `PixelPoint` in the global tile pixel space.
 *
 * @example
 * latLngToPixel({ lat: 0, lng: 0 }, 0); // { x: 128, y: 128 } — center of 256×256
 * latLngToPixel({ lat: 0, lng: 0 }, 1); // { x: 256, y: 256 } — center of 512×512
 */
export function latLngToPixel(latLng: LatLng, zoom: number): PixelPoint {
  const scale = 256 * Math.pow(2, zoom);
  const { x: mx, y: my } = latLngToMercator(latLng);
  const maxMerc = Math.PI * R;
  const px = ((mx + maxMerc) / (2 * maxMerc)) * scale;
  const py = ((maxMerc - my) / (2 * maxMerc)) * scale;
  return { x: px, y: py };
}

/**
 * Converts global pixel coordinates back to a WGS84 geographic coordinate.
 *
 * This is the exact inverse of `latLngToPixel`.
 * Round-trip invariant: `pixelToLatLng(latLngToPixel(p, z), z) ≈ p`.
 *
 * @param pixel - Pixel point in the global tile pixel space.
 * @param zoom  - Zoom level (0–22). Must match the zoom used when encoding.
 * @returns `LatLng` in degrees.
 *
 * @example
 * pixelToLatLng({ x: 128, y: 128 }, 0); // { lat: 0, lng: 0 }
 */
export function pixelToLatLng(pixel: PixelPoint, zoom: number): LatLng {
  const scale = 256 * Math.pow(2, zoom);
  const maxMerc = Math.PI * R;
  const mx = (pixel.x / scale) * (2 * maxMerc) - maxMerc;
  const my = maxMerc - (pixel.y / scale) * (2 * maxMerc);
  return mercatorToLatLng({ x: mx, y: my });
}
