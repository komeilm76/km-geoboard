import { describe, it, expect } from 'vitest';
import {
  latLngToMercator,
  mercatorToLatLng,
  latLngToPixel,
  pixelToLatLng,
} from '../src/projection';

// ─── latLngToMercator ─────────────────────────────────────────────────────────

describe('latLngToMercator', () => {
  it('maps the origin (equator / prime meridian) to (0, 0)', () => {
    const result = latLngToMercator({ lat: 0, lng: 0 });
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('maps a positive longitude to positive x', () => {
    const result = latLngToMercator({ lat: 0, lng: 90 });
    expect(result.x).toBeGreaterThan(0);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('maps a positive latitude to positive y', () => {
    const result = latLngToMercator({ lat: 45, lng: 0 });
    expect(result.y).toBeGreaterThan(0);
    expect(result.x).toBeCloseTo(0, 5);
  });

  it('maps London to expected Mercator coordinates', () => {
    // Reference (EPSG:3857, R = 6378137):
    //   x = lng·π/180 · R              = -14204.367 m
    //   y = ln(tan(π/4 + lat·π/360)) · R = 6711542.476 m
    const result = latLngToMercator({ lat: 51.5074, lng: -0.1276 });
    expect(result.x).toBeCloseTo(-14204.37, 1);
    expect(result.y).toBeCloseTo(6711542.48, 1);
  });
});

// ─── mercatorToLatLng ─────────────────────────────────────────────────────────

describe('mercatorToLatLng', () => {
  it('maps (0, 0) to the origin LatLng', () => {
    const result = mercatorToLatLng({ x: 0, y: 0 });
    expect(result.lat).toBeCloseTo(0, 5);
    expect(result.lng).toBeCloseTo(0, 5);
  });
});

// ─── Round-trip: latLngToMercator / mercatorToLatLng ─────────────────────────

describe('latLngToMercator / mercatorToLatLng round-trip', () => {
  const points = [
    { lat: 0, lng: 0 },      // origin
    { lat: 51.5074, lng: -0.1276 }, // London
    { lat: 48.8566, lng: 2.3522 },  // Paris
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: 0, lng: 180 },    // date line (equator)
    { lat: 0, lng: -180 },   // date line (equator, west)
    { lat: 85, lng: 0 },     // near north pole limit
    { lat: -85, lng: 0 },    // near south pole limit
  ];

  for (const p of points) {
    it(`round-trips ({ lat: ${p.lat}, lng: ${p.lng} })`, () => {
      const mercator = latLngToMercator(p);
      const back = mercatorToLatLng(mercator);
      expect(back.lat).toBeCloseTo(p.lat, 5);
      expect(back.lng).toBeCloseTo(p.lng, 5);
    });
  }
});

// ─── latLngToPixel ────────────────────────────────────────────────────────────

describe('latLngToPixel', () => {
  it('maps the world center to (128, 128) at zoom 0', () => {
    const result = latLngToPixel({ lat: 0, lng: 0 }, 0);
    expect(result.x).toBeCloseTo(128, 3);
    expect(result.y).toBeCloseTo(128, 3);
  });

  it('maps the world center to (256, 256) at zoom 1', () => {
    const result = latLngToPixel({ lat: 0, lng: 0 }, 1);
    expect(result.x).toBeCloseTo(256, 3);
    expect(result.y).toBeCloseTo(256, 3);
  });

  it('maps top-left corner (approx) to near (0, 0) at zoom 0', () => {
    const result = latLngToPixel({ lat: 85.0511, lng: -180 }, 0);
    expect(result.x).toBeCloseTo(0, 0);
    expect(result.y).toBeCloseTo(0, 0);
  });
});

// ─── Round-trip: latLngToPixel / pixelToLatLng ────────────────────────────────

describe('latLngToPixel / pixelToLatLng round-trip', () => {
  const points = [
    { lat: 0, lng: 0 },
    { lat: 51.5074, lng: -0.1276 },
    { lat: 48.8566, lng: 2.3522 },
    { lat: -33.8688, lng: 151.2093 },
  ];

  const zooms = [0, 5, 10, 15, 20];

  for (const p of points) {
    for (const z of zooms) {
      it(`round-trips ({ lat: ${p.lat}, lng: ${p.lng} }) at zoom ${z}`, () => {
        const pixel = latLngToPixel(p, z);
        const back = pixelToLatLng(pixel, z);
        expect(back.lat).toBeCloseTo(p.lat, 5);
        expect(back.lng).toBeCloseTo(p.lng, 5);
      });
    }
  }
});
