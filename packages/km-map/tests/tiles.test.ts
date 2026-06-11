import { describe, it, expect } from 'vitest';
import {
  latLngToTile,
  tileToBounds,
  tilesForBounds,
  tileToQuadKey,
  quadKeyToTile,
} from '../src/tiles';

// ─── latLngToTile ─────────────────────────────────────────────────────────────

describe('latLngToTile', () => {
  it('returns { x:0, y:0, z:0 } at zoom 0 for any point', () => {
    expect(latLngToTile({ lat: 0, lng: 0 }, 0)).toEqual({ x: 0, y: 0, z: 0 });
    expect(latLngToTile({ lat: 51.5, lng: -0.12 }, 0)).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('at zoom 1, the world is divided into 4 tiles', () => {
    // NW quadrant
    expect(latLngToTile({ lat: 45, lng: -90 }, 1)).toEqual({ x: 0, y: 0, z: 1 });
    // NE quadrant
    expect(latLngToTile({ lat: 45, lng: 90 }, 1)).toEqual({ x: 1, y: 0, z: 1 });
    // SW quadrant
    expect(latLngToTile({ lat: -45, lng: -90 }, 1)).toEqual({ x: 0, y: 1, z: 1 });
    // SE quadrant
    expect(latLngToTile({ lat: -45, lng: 90 }, 1)).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('returns integer tile indices', () => {
    const tile = latLngToTile({ lat: 51.5074, lng: -0.1276 }, 10);
    expect(Number.isInteger(tile.x)).toBe(true);
    expect(Number.isInteger(tile.y)).toBe(true);
    expect(tile.z).toBe(10);
  });

  it('clamps to valid tile range', () => {
    const tile = latLngToTile({ lat: 85.05, lng: 180 }, 5);
    const max = Math.pow(2, 5) - 1;
    expect(tile.x).toBeLessThanOrEqual(max);
    expect(tile.y).toBeLessThanOrEqual(max);
    expect(tile.x).toBeGreaterThanOrEqual(0);
    expect(tile.y).toBeGreaterThanOrEqual(0);
  });
});

// ─── tileToBounds ─────────────────────────────────────────────────────────────

describe('tileToBounds', () => {
  it('returns a 4-element tuple [west, south, east, north]', () => {
    const bounds = tileToBounds({ x: 0, y: 0, z: 1 });
    expect(bounds).toHaveLength(4);
    const [west, south, east, north] = bounds;
    expect(west).toBeLessThan(east);
    expect(south).toBeLessThan(north);
  });

  it('point used for latLngToTile falls inside tileToBounds result', () => {
    const points = [
      { lat: 51.5074, lng: -0.1276 },
      { lat: 48.8566, lng: 2.3522 },
      { lat: -33.8688, lng: 151.2093 },
    ];
    const zooms = [5, 10, 15];

    for (const p of points) {
      for (const z of zooms) {
        const tile = latLngToTile(p, z);
        const [west, south, east, north] = tileToBounds(tile);
        expect(p.lng).toBeGreaterThanOrEqual(west);
        expect(p.lng).toBeLessThanOrEqual(east);
        expect(p.lat).toBeGreaterThanOrEqual(south);
        expect(p.lat).toBeLessThanOrEqual(north);
      }
    }
  });

  it('zoom-0 tile covers (approximately) the whole world', () => {
    const [west, south, east, north] = tileToBounds({ x: 0, y: 0, z: 0 });
    expect(west).toBeCloseTo(-180, 0);
    expect(east).toBeCloseTo(180, 0);
    expect(south).toBeLessThan(-80);
    expect(north).toBeGreaterThan(80);
  });
});

// ─── tilesForBounds ───────────────────────────────────────────────────────────

describe('tilesForBounds', () => {
  it('returns a single tile for the whole world at zoom 0', () => {
    const tiles = tilesForBounds([-180, -85.05, 180, 85.05], 0);
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('returns 4 tiles for the whole world at zoom 1', () => {
    const tiles = tilesForBounds([-180, -85.05, 180, 85.05], 1);
    expect(tiles).toHaveLength(4);
  });

  it('returns correct count for a small bounding box', () => {
    // London bounding box at zoom 10
    const tiles = tilesForBounds([-0.5, 51.3, 0.3, 51.7], 10);
    expect(tiles.length).toBeGreaterThan(0);
    // All returned tiles should have correct zoom
    for (const t of tiles) {
      expect(t.z).toBe(10);
    }
  });

  it('all returned tiles have integer coordinates', () => {
    const tiles = tilesForBounds([-10, -10, 10, 10], 5);
    for (const t of tiles) {
      expect(Number.isInteger(t.x)).toBe(true);
      expect(Number.isInteger(t.y)).toBe(true);
    }
  });
});

// ─── tileToQuadKey ────────────────────────────────────────────────────────────

describe('tileToQuadKey', () => {
  it('returns empty string for zoom 0', () => {
    expect(tileToQuadKey({ x: 0, y: 0, z: 0 })).toBe('');
  });

  it('returns correct single-character quadkey at zoom 1', () => {
    expect(tileToQuadKey({ x: 0, y: 0, z: 1 })).toBe('0');
    expect(tileToQuadKey({ x: 1, y: 0, z: 1 })).toBe('1');
    expect(tileToQuadKey({ x: 0, y: 1, z: 1 })).toBe('2');
    expect(tileToQuadKey({ x: 1, y: 1, z: 1 })).toBe('3');
  });

  it('quadkey length equals zoom level', () => {
    expect(tileToQuadKey({ x: 3, y: 5, z: 3 })).toHaveLength(3);
    expect(tileToQuadKey({ x: 100, y: 200, z: 10 })).toHaveLength(10);
  });
});

// ─── quadKeyToTile ────────────────────────────────────────────────────────────

describe('quadKeyToTile', () => {
  it('converts empty string to zoom-0 tile', () => {
    const result = quadKeyToTile('');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('converts single-character quadkeys correctly', () => {
    const cases = [
      { key: '0', expected: { x: 0, y: 0, z: 1 } },
      { key: '1', expected: { x: 1, y: 0, z: 1 } },
      { key: '2', expected: { x: 0, y: 1, z: 1 } },
      { key: '3', expected: { x: 1, y: 1, z: 1 } },
    ];
    for (const { key, expected } of cases) {
      const result = quadKeyToTile(key);
      expect(result.success).toBe(true);
      if (!result.success) continue;
      expect(result.data).toEqual(expected);
    }
  });

  it('returns error for invalid character', () => {
    const result = quadKeyToTile('4');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('invalid-quadkey');
  });

  it('returns error for letter in quadkey', () => {
    const result = quadKeyToTile('012a');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('invalid-quadkey');
  });
});

// ─── Round-trip: tileToQuadKey / quadKeyToTile ────────────────────────────────

describe('tileToQuadKey / quadKeyToTile round-trip', () => {
  const tiles = [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 3, y: 5, z: 3 },
    { x: 100, y: 200, z: 10 },
    { x: 511, y: 340, z: 10 },
  ];

  for (const tile of tiles) {
    it(`round-trips tile { x:${tile.x}, y:${tile.y}, z:${tile.z} }`, () => {
      const key = tileToQuadKey(tile);
      const result = quadKeyToTile(key);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(tile);
    });
  }
});
