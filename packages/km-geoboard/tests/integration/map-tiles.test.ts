/**
 * Integration: latLngToTile → tileToBounds → bounds contain the original
 * point. Packages exercised: km-map.
 */
import { describe, it, expect } from 'vitest';
import { map } from '../../src/index';

const POINTS = [
  { name: 'London', lat: 51.5074, lng: -0.1276 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Quito (≈equator)', lat: -0.1807, lng: -78.4678 },
  { name: 'Reykjavík', lat: 64.1466, lng: -21.9426 },
];

const ZOOMS = [0, 3, 8, 14, 18];

describe('tile math round-trip', () => {
  for (const p of POINTS) {
    for (const z of ZOOMS) {
      it(`tile bounds contain ${p.name} at z${z}`, () => {
        const tile = map.latLngToTile({ lat: p.lat, lng: p.lng }, z);
        expect(tile.z).toBe(z);
        expect(Number.isInteger(tile.x)).toBe(true);
        expect(Number.isInteger(tile.y)).toBe(true);

        const [west, south, east, north] = map.tileToBounds(tile);
        expect(p.lng).toBeGreaterThanOrEqual(west);
        expect(p.lng).toBeLessThanOrEqual(east);
        expect(p.lat).toBeGreaterThanOrEqual(south);
        expect(p.lat).toBeLessThanOrEqual(north);
      });
    }
  }

  it('quadkey round-trips the tile coordinate', () => {
    const tile = map.latLngToTile({ lat: 51.5074, lng: -0.1276 }, 12);
    const quadKey = map.tileToQuadKey(tile);
    const back = map.quadKeyToTile(quadKey);
    expect(back.success).toBe(true);
    if (!back.success) return;
    expect(back.data).toEqual(tile);
  });
});
