import { describe, it, expect } from 'vitest';
import { haversineDistance, rhumbDistance, bearing, destinationPoint, polygonArea } from '../src/distance';
import type { GeoJsonPolygon } from 'km-geojson';

// ─── haversineDistance ────────────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    expect(haversineDistance({ lat: 51.5, lng: -0.12 }, { lat: 51.5, lng: -0.12 })).toBe(0);
    expect(haversineDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
  });

  it('London → Paris is approximately 343,934 m (within 0.5%)', () => {
    // Reference: spherical haversine with WGS84 semi-major axis R = 6378137 m
    // (matches src/distance.ts). Independently derived: 343,933.6 m.
    // Bounds are relative (±0.5%) per project-evaluation 02 §B.
    const expected = 343_934;
    const dist = haversineDistance(
      { lat: 51.5074, lng: -0.1276 },
      { lat: 48.8566, lng: 2.3522 },
    );
    expect(dist).toBeGreaterThan(expected * 0.995);
    expect(dist).toBeLessThan(expected * 1.005);
  });

  it('is symmetric: dist(a,b) === dist(b,a)', () => {
    const a = { lat: 51.5074, lng: -0.1276 };
    const b = { lat: 48.8566, lng: 2.3522 };
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 3);
  });

  it('equator to north pole is approximately 10,000 km', () => {
    const dist = haversineDistance({ lat: 0, lng: 0 }, { lat: 90, lng: 0 });
    // Earth quarter circumference ≈ 10,007,543 m
    expect(dist).toBeGreaterThan(9_900_000);
    expect(dist).toBeLessThan(10_100_000);
  });
});

// ─── rhumbDistance ────────────────────────────────────────────────────────────

describe('rhumbDistance', () => {
  it('returns 0 for identical points', () => {
    expect(rhumbDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
  });

  it('is approximately equal to haversine for short distances', () => {
    const a = { lat: 51.5, lng: -0.1 };
    const b = { lat: 51.6, lng: -0.1 };
    const hav = haversineDistance(a, b);
    const rhu = rhumbDistance(a, b);
    // For a short north-south segment, rhumb and haversine should agree closely
    expect(rhu).toBeCloseTo(hav, -2); // within ~100m
  });

  it('equatorial rhumb is positive and non-zero', () => {
    const dist = rhumbDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 90 });
    expect(dist).toBeGreaterThan(0);
  });
});

// ─── bearing ──────────────────────────────────────────────────────────────────

describe('bearing', () => {
  it('due north bearing is 0°', () => {
    const b = bearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(b).toBeCloseTo(0, 3);
  });

  it('due east bearing is 90°', () => {
    const b = bearing({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(b).toBeCloseTo(90, 2);
  });

  it('due south bearing is 180°', () => {
    const b = bearing({ lat: 1, lng: 0 }, { lat: 0, lng: 0 });
    expect(b).toBeCloseTo(180, 2);
  });

  it('due west bearing is 270°', () => {
    const b = bearing({ lat: 0, lng: 1 }, { lat: 0, lng: 0 });
    expect(b).toBeCloseTo(270, 2);
  });

  it('always returns a value in [0, 360)', () => {
    const pairs = [
      [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }],
      [{ lat: 50, lng: 10 }, { lat: -30, lng: -80 }],
      [{ lat: -10, lng: -150 }, { lat: 10, lng: 150 }],
    ] as const;
    for (const [a, b] of pairs) {
      const result = bearing(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    }
  });
});

// ─── destinationPoint ─────────────────────────────────────────────────────────

describe('destinationPoint', () => {
  it('travelling 0 meters returns the origin', () => {
    const dest = destinationPoint({ lat: 51.5, lng: -0.12 }, 45, 0);
    expect(dest.lat).toBeCloseTo(51.5, 5);
    expect(dest.lng).toBeCloseTo(-0.12, 5);
  });

  it('due north from equator increases latitude', () => {
    const dest = destinationPoint({ lat: 0, lng: 0 }, 0, 111_195);
    expect(dest.lat).toBeCloseTo(1, 1);
    expect(dest.lng).toBeCloseTo(0, 3);
  });

  it('round-trip: bearing + haversineDistance agree with original', () => {
    const origin = { lat: 48.8566, lng: 2.3522 }; // Paris
    const originalBearing = 45;
    const originalDistance = 500_000; // 500 km

    const dest = destinationPoint(origin, originalBearing, originalDistance);

    const recoveredBearing = bearing(origin, dest);
    const recoveredDistance = haversineDistance(origin, dest);

    expect(recoveredBearing).toBeCloseTo(originalBearing, 1);
    expect(recoveredDistance).toBeCloseTo(originalDistance, -2); // within 100m
  });

  it('round-trip from London at 270° for 100 km', () => {
    const origin = { lat: 51.5074, lng: -0.1276 };
    const dist = 100_000;
    const brng = 270;

    const dest = destinationPoint(origin, brng, dist);
    expect(haversineDistance(origin, dest)).toBeCloseTo(dist, -3);
    expect(bearing(origin, dest)).toBeCloseTo(brng, 0);
  });
});

// ─── polygonArea ──────────────────────────────────────────────────────────────

describe('polygonArea', () => {
  it('returns 0 for a degenerate polygon with no rings', () => {
    const poly: GeoJsonPolygon = { type: 'Polygon', coordinates: [] };
    expect(polygonArea(poly)).toBe(0);
  });

  it('1°×1° square near the equator is approximately 12,300 km²', () => {
    const poly: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    };
    const area = polygonArea(poly);
    // 1°×1° at equator ≈ 12,308 km² = 12,308,000,000 m²
    // Allow ±5% tolerance for spherical approximation
    expect(area).toBeGreaterThan(11_700_000_000);
    expect(area).toBeLessThan(12_900_000_000);
  });

  it('returns positive area regardless of ring winding order', () => {
    const cw: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
    };
    const area = polygonArea(cw);
    expect(area).toBeGreaterThan(0);
  });

  it('polygon with a hole has smaller area than polygon without', () => {
    const solid: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
    };
    const withHole: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]],
        [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]],
      ],
    };
    expect(polygonArea(withHole)).toBeLessThan(polygonArea(solid));
  });
});
