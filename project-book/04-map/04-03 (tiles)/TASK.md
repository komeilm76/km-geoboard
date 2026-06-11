# Page 04-03 — Tile Functions

## Summary
Implements `latLngToTile`, `tileToBounds`, `tilesForBounds`, `tileToQuadKey`,
and `quadKeyToTile` — all tile coordinate math for the XYZ/TMS tile systems.

## Target
`packages/km-map/src/tiles.ts` exports all 5 tile functions with tests.

## Dependencies
- Page 04-02 (projection) — `latLngToPixel` is reused internally

## Inputs
- `DT-Map.md` — all tile function specs and tile coordinate conventions.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-map/src/tiles.ts` | All 5 tile functions |
| `packages/km-map/tests/tiles.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-map/src/tiles.ts`.

2. Implement `latLngToTile(latLng: LatLng, zoom: number): TileCoord`:
   - Use `latLngToPixel` and divide by 256 to get tile coordinates.
   - Floor to integer tile indices.
   - Clamp to valid range `[0, 2^zoom - 1]`.

3. Implement `tileToBounds(tile: TileCoord): [number, number, number, number]`:
   - Compute the four corners of the tile in geographic coordinates.
   - Use the inverse: convert pixel corners to `LatLng`.
   - Return `[west, south, east, north]`.

4. Implement `tilesForBounds(bounds: [number, number, number, number], zoom: number): TileCoord[]`:
   - Convert SW and NE corners to tile coordinates.
   - Enumerate all tiles in the rectangular range.
   - Warn in JSDoc: can be very large at high zoom levels.

5. Implement `tileToQuadKey(tile: TileCoord): string`:
   - Bing Maps quadkey algorithm: for each bit from MSB to LSB of the zoom
     level, check the x and y bits and append `'0'`, `'1'`, `'2'`, or `'3'`.

6. Implement `quadKeyToTile(quadKey: string): Result<TileCoord>`:
   - Reverse of `tileToQuadKey`.
   - Return error for invalid characters in the quadkey.

7. Export all, add JSDoc, write tests.

   Tests must cover:
   - `latLngToTile` at zoom 0 (→ `{x:0, y:0, z:0}`), zoom 1 (4 tiles), zoom 10.
   - `tileToBounds` round-trip with `latLngToTile` (point is inside returned bounds).
   - `tilesForBounds` returns correct count for a small bounding box.
   - `tileToQuadKey` / `quadKeyToTile` round-trip.
   - `quadKeyToTile` error on invalid input.

## Acceptance Criteria

- [ ] `latLngToTile` returns integer tile coordinates
- [ ] `tileToBounds` returns `[west, south, east, north]` in degrees
- [ ] `tilesForBounds` returns all tiles that intersect the bounds
- [ ] `tileToQuadKey` / `quadKeyToTile` round-trip correctly
- [ ] `quadKeyToTile` returns error for invalid quadkey characters
- [ ] All tests pass, build clean

## Notes
- At zoom 0 there is exactly one tile covering the entire world: `{x:0, y:0, z:0}`.
- `tilesForBounds` can return thousands of tiles at zoom 18+. The function is
  correct but consumers must handle large arrays. Document this in JSDoc.
