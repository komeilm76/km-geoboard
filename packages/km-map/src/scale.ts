/**
 * Scale and zoom utility functions.
 *
 * Conversions between zoom levels, map scale denominators, and ground resolution
 * (meters per pixel). All calculations are at the equator unless otherwise noted,
 * using the standard 96 DPI screen resolution.
 */

/** WGS84 semi-major axis radius in meters. */
const R = 6378137;

/** Standard screen resolution used for scale calculations. */
const DPI = 96;

/** Meters per inch (25.4 mm). */
const METERS_PER_INCH = 0.0254;

// ─── zoomToScale ──────────────────────────────────────────────────────────────

/**
 * Converts a map zoom level to a scale denominator at the equator, assuming
 * 96 DPI display and 256 px tile size.
 *
 * The scale denominator `s` means 1 unit on screen = `s` units in the real world.
 * For example, scale 1:100,000 means 1 cm on screen = 1 km on the ground.
 *
 * @param zoom - Zoom level (0–22).
 * @returns Scale denominator (e.g. 559,082,264 at zoom 0).
 *
 * @example
 * zoomToScale(0);  // ≈ 559,082,264
 * zoomToScale(18); // ≈ 2,132
 */
export function zoomToScale(zoom: number): number {
  // pixels per meter at the equator = (2^zoom * 256) / (2π * R)
  // scale = 1 / (pixels_per_meter * meters_per_pixel_on_screen)
  // meters_per_pixel_on_screen = METERS_PER_INCH / DPI
  const pixelsPerMeter = (Math.pow(2, zoom) * 256) / (2 * Math.PI * R);
  const screenMetersPerPixel = METERS_PER_INCH / DPI;
  return 1 / (pixelsPerMeter * screenMetersPerPixel);
}

// ─── scaleToZoom ──────────────────────────────────────────────────────────────

/**
 * Converts a scale denominator to a map zoom level at the equator (96 DPI).
 *
 * This is the exact inverse of `zoomToScale`.
 * Round-trip invariant: `scaleToZoom(zoomToScale(z)) ≈ z`.
 *
 * @param scale - Scale denominator (must be > 0).
 * @returns Zoom level (floating point — round/floor as needed for integer zoom).
 *
 * @example
 * scaleToZoom(559082264); // ≈ 0
 * scaleToZoom(2132);      // ≈ 18
 */
export function scaleToZoom(scale: number): number {
  const screenMetersPerPixel = METERS_PER_INCH / DPI;
  const pixelsPerMeter = 1 / (scale * screenMetersPerPixel);
  return Math.log2((pixelsPerMeter * 2 * Math.PI * R) / 256);
}

// ─── metersPerPixel ───────────────────────────────────────────────────────────

/**
 * Returns the ground resolution in meters per pixel at the given zoom level
 * and latitude.
 *
 * Ground resolution decreases (pixels represent smaller areas) as zoom increases.
 * It also decreases at higher latitudes because the Mercator projection stretches
 * near the poles.
 *
 * @param zoom - Zoom level (0–22).
 * @param lat  - Latitude in degrees. Use 0 for the equatorial value.
 * @returns Meters per pixel at the given zoom and latitude.
 *
 * @example
 * metersPerPixel(0, 0);  // ≈ 156,543 m/px (equator, zoom 0)
 * metersPerPixel(10, 0); // ≈ 152 m/px
 * metersPerPixel(10, 51.5); // ≈ 95 m/px (London latitude)
 */
export function metersPerPixel(zoom: number, lat: number): number {
  return (2 * Math.PI * R * Math.cos((lat * Math.PI) / 180)) /
    (256 * Math.pow(2, zoom));
}
