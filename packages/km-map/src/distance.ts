/**
 * Geographic distance, bearing, and area functions.
 *
 * All functions operate on WGS84 coordinates and treat the Earth as a sphere
 * with the WGS84 semi-major axis radius. Results are accurate to within ~0.5%
 * for typical geographic distances.
 */

import type { LatLng } from './types';
import type { GeoJsonPolygon } from '@komeilm76/km-geojson';

/** WGS84 semi-major axis radius in meters. */
const R = 6378137;

/** Converts degrees to radians. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Converts radians to degrees. */
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ─── haversineDistance ────────────────────────────────────────────────────────

/**
 * Calculates the great-circle distance between two geographic points using
 * the Haversine formula.
 *
 * Uses Math.atan2 rather than Math.asin for numerical stability near the
 * antipodal point. Returns 0 when both points are identical.
 *
 * @param from - Starting point (WGS84).
 * @param to   - Ending point (WGS84).
 * @returns Distance in meters.
 *
 * @example
 * haversineDistance({ lat: 51.5074, lng: -0.1276 }, { lat: 48.8566, lng: 2.3522 }); // ~340000
 * haversineDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }); // 0
 */
export function haversineDistance(from: LatLng, to: LatLng): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(to.lat);
  const dPhi = toRad(to.lat - from.lat);
  const dLambda = toRad(to.lng - from.lng);
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── rhumbDistance ────────────────────────────────────────────────────────────

/**
 * Calculates the rhumb-line (constant-bearing / loxodrome) distance between
 * two geographic points.
 *
 * A rhumb line crosses every meridian at the same angle — useful for
 * navigation where maintaining a constant compass bearing is desired.
 *
 * @param from - Starting point (WGS84).
 * @param to   - Ending point (WGS84).
 * @returns Distance in meters along the rhumb line.
 *
 * @example
 * rhumbDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 90 }); // ~10007543 m
 */
export function rhumbDistance(from: LatLng, to: LatLng): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(to.lat);
  const dPhi = phi2 - phi1;
  let dLambda = toRad(to.lng - from.lng);

  if (Math.abs(dLambda) > Math.PI) {
    dLambda = dLambda > 0 ? -(2 * Math.PI - dLambda) : 2 * Math.PI + dLambda;
  }

  const dPsi = Math.log(
    Math.tan(Math.PI / 4 + phi2 / 2) / Math.tan(Math.PI / 4 + phi1 / 2),
  );
  const q = Math.abs(dPsi) > 1e-12 ? dPhi / dPsi : Math.cos(phi1);

  return Math.sqrt(dPhi ** 2 + q ** 2 * dLambda ** 2) * R;
}

// ─── bearing ──────────────────────────────────────────────────────────────────

/**
 * Calculates the initial bearing (forward azimuth) from one point to another.
 *
 * 0 = due north, 90 = due east, 180 = due south, 270 = due west.
 * The bearing is measured clockwise from north.
 *
 * @param from - Starting point (WGS84).
 * @param to   - Destination point (WGS84).
 * @returns Initial bearing in degrees (0-360).
 *
 * @example
 * bearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }); // ~0 (due north)
 * bearing({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }); // ~90 (due east)
 */
export function bearing(from: LatLng, to: LatLng): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(to.lat);
  const dLambda = toRad(to.lng - from.lng);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((toDeg(Math.atan2(y, x)) + 360) % 360);
}

// ─── destinationPoint ─────────────────────────────────────────────────────────

/**
 * Returns the destination point when travelling from origin along the given
 * initial bearing for the given distance.
 *
 * This is the inverse of bearing + haversineDistance:
 * given dest = destinationPoint(a, theta, d), then
 * bearing(a, dest) ~= theta and haversineDistance(a, dest) ~= d.
 *
 * @param origin   - Starting geographic coordinate (WGS84).
 * @param brng     - Initial bearing in degrees (0 = north, clockwise).
 * @param distance - Distance to travel in meters.
 * @returns Destination LatLng.
 *
 * @example
 * destinationPoint({ lat: 0, lng: 0 }, 0, 111195); // ~{ lat: 1, lng: 0 }
 */
export function destinationPoint(origin: LatLng, brng: number, distance: number): LatLng {
  const delta = distance / R;
  const theta = toRad(brng);
  const phi1 = toRad(origin.lat);
  const lambda1 = toRad(origin.lng);

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);
  const y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  const x = Math.cos(delta) - Math.sin(phi1) * sinPhi2;
  const lambda2 = lambda1 + Math.atan2(y, x);

  return {
    lat: toDeg(phi2),
    lng: ((toDeg(lambda2) + 540) % 360) - 180,
  };
}

// ─── polygonArea ──────────────────────────────────────────────────────────────

/**
 * Approximates the area of a GeoJSON Polygon in square meters using the
 * spherical excess formula.
 *
 * Handles polygons with holes (interior rings): exterior ring area minus
 * the sum of all interior ring areas.
 *
 * Accuracy is good for typical map-scale polygons. For very large polygons
 * (continent-scale), an ellipsoidal area formula gives better results.
 *
 * @param polygon - GeoJSON Polygon geometry. Coordinates are [lng, lat] pairs.
 * @returns Area in square meters (always positive).
 *
 * @example
 * polygonArea({
 *   type: "Polygon",
 *   coordinates: [[[0,0],[1,0],[1,1],[0,1],[0,0]]]
 * }); // ~12308000000
 */
export function polygonArea(polygon: GeoJsonPolygon): number {
  const rings = polygon.coordinates;
  if (rings.length === 0) return 0;

  const [exterior, ...holes] = rings;

  const exteriorArea = ringArea(exterior as [number, number][]);
  const holeArea = holes.reduce(
    (sum: number, ring) => sum + ringArea(ring as [number, number][]),
    0,
  );

  return Math.abs(exteriorArea) - holeArea;
}

/**
 * Computes the signed area of a single ring using the spherical excess formula.
 * Coordinates are [lng, lat] as per GeoJSON convention.
 */
function ringArea(ring: [number, number][]): number {
  const n = ring.length;
  if (n < 4) return 0;

  let area = 0;
  for (let i = 0; i < n - 1; i++) {
    const p1 = ring[i]!;
    const p2 = ring[i + 1]!;
    area +=
      toRad(p2[0] - p1[0]) *
      (2 + Math.sin(toRad(p1[1])) + Math.sin(toRad(p2[1])));
  }

  return Math.abs((area * R * R) / 2);
}
