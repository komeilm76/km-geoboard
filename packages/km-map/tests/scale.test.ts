import { describe, it, expect } from 'vitest';
import { zoomToScale, scaleToZoom, metersPerPixel } from '../src/scale';

// ─── zoomToScale ──────────────────────────────────────────────────────────────

describe('zoomToScale', () => {
  it('zoom 0 produces a very large scale denominator', () => {
    const scale = zoomToScale(0);
    expect(scale).toBeGreaterThan(500_000_000);
    expect(scale).toBeLessThan(600_000_000);
  });

  it('scale denominator decreases as zoom increases', () => {
    expect(zoomToScale(0)).toBeGreaterThan(zoomToScale(5));
    expect(zoomToScale(5)).toBeGreaterThan(zoomToScale(10));
    expect(zoomToScale(10)).toBeGreaterThan(zoomToScale(18));
  });

  it('zoom 18 produces a small scale denominator (city level)', () => {
    const scale = zoomToScale(18);
    expect(scale).toBeGreaterThan(1_000);
    expect(scale).toBeLessThan(5_000);
  });
});

// ─── scaleToZoom ──────────────────────────────────────────────────────────────

describe('scaleToZoom', () => {
  it('round-trips with zoomToScale', () => {
    const zooms = [0, 1, 5, 10, 15, 18];
    for (const z of zooms) {
      const scale = zoomToScale(z);
      const back = scaleToZoom(scale);
      expect(back).toBeCloseTo(z, 5);
    }
  });
});

// ─── metersPerPixel ───────────────────────────────────────────────────────────

describe('metersPerPixel', () => {
  it('decreases as zoom increases (at equator)', () => {
    expect(metersPerPixel(0, 0)).toBeGreaterThan(metersPerPixel(5, 0));
    expect(metersPerPixel(5, 0)).toBeGreaterThan(metersPerPixel(10, 0));
    expect(metersPerPixel(10, 0)).toBeGreaterThan(metersPerPixel(18, 0));
  });

  it('decreases at higher latitudes for the same zoom', () => {
    // At higher latitudes, fewer real-world meters per pixel due to projection
    const mppEquator = metersPerPixel(10, 0);
    const mppLondon = metersPerPixel(10, 51.5);
    expect(mppLondon).toBeLessThan(mppEquator);
  });

  it('at zoom 0 equator is approximately 156,543 m/px', () => {
    const mpp = metersPerPixel(0, 0);
    expect(mpp).toBeGreaterThan(150_000);
    expect(mpp).toBeLessThan(165_000);
  });

  it('is 0 at the poles (lat 90)', () => {
    const mpp = metersPerPixel(10, 90);
    expect(mpp).toBeCloseTo(0, 5);
  });
});
