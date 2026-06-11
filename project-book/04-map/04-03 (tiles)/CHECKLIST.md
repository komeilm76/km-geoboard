# Checklist — Page 04-03 Tile Functions

- [x] `tiles.ts` created
- [x] `latLngToTile` exported — returns floored integer tile coords
- [x] `tileToBounds` exported — returns `[west, south, east, north]`
- [x] `tilesForBounds` exported — enumerates all tiles in bounds
- [x] `tileToQuadKey` exported
- [x] `quadKeyToTile` exported — returns `Result<TileCoord>`
- [x] `quadKeyToTile` returns error for invalid characters
- [x] All 5 functions exported from `index.ts`
- [x] JSDoc with `@example` on every function
- [x] `tilesForBounds` JSDoc warns about large result at high zoom
- [x] Tests: `latLngToTile` at zoom 0 → `{x:0,y:0,z:0}`
- [x] Tests: `tileToBounds` / `latLngToTile` round-trip (point inside returned bounds)
- [x] Tests: `tileToQuadKey` / `quadKeyToTile` round-trip
- [x] Tests: `quadKeyToTile` error on invalid input
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-map build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-map/dist/` returns empty
