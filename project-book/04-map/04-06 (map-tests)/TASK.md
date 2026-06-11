# Page 04-06 — Map Package Finalization

## Summary
Completes `packages/km-map/help.md` with the full API reference, updates
`CHANGELOG.md`, and runs the CI suite to sign off the map chapter.

## Target
`packages/km-map/help.md` complete. All tests pass. CI passes.

## Dependencies
- Page 04-05 (bounds)

## Inputs
- `DT-Map.md` — all function specs, coordinate system explanations.
- `DT-Logics.md` — `help.md` structure.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-map/help.md` | Complete API documentation |
| `packages/km-map/CHANGELOG.md` | Updated |

## Step-by-Step Instructions

1. Write `packages/km-map/help.md`:

   **Overview** — "Pure coordinate math and geographic utilities. No map renderer
   required. Works in Node.js, browser, and edge runtimes."

   **Installation**.

   **Coordinate Systems** — short section explaining WGS84, Web Mercator,
   Tile XYZ, and pixel coordinate systems.

   **Functions** — grouped by file:
   - Projections: `latLngToMercator`, `mercatorToLatLng`, `latLngToPixel`, `pixelToLatLng`.
   - Tiles: `latLngToTile`, `tileToBounds`, `tilesForBounds`, `tileToQuadKey`, `quadKeyToTile`.
   - Distance: `haversineDistance`, `rhumbDistance`, `bearing`, `destinationPoint`, `polygonArea`.
   - Bounds: 6 functions.
   - Scale: 3 functions.
   - Layers: `detectLayerFormat`, `makeGeoJsonSource`, `makeXyzSource`.
   Each: input table, output description, example.

   **Types** — `LatLng`, `MercatorPoint`, `TileCoord`, `BoundingBox`, `SupportedLayerFormat`.

   **Errors** — only `Result`-returning functions: `quadKeyToTile` with error code table.

2. Update `CHANGELOG.md`.

3. Run full CI:
   ```bash
   pnpm --filter @komeilm76/km-map lint
   pnpm --filter @komeilm76/km-map test
   pnpm --filter @komeilm76/km-map build
   grep -rn "^import.*zod" packages/km-map/dist/
   ```

## Acceptance Criteria

- [x] `help.md` complete with all sections
- [x] All 20 functions documented with examples
- [x] Coordinate systems section explains all 4 systems
- [x] `CHANGELOG.md` updated
- [x] Full CI suite passes
- [x] Zod-leak check returns empty

## Notes
- After this page, Chapter 04 is complete. Chapters 05 and 06 can now depend
  on `@komeilm76/km-map`.
