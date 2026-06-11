# Page 04-01 — Map Types

## Summary
Creates the `@komeilm76/km-map` package skeleton and defines every TypeScript type
the map domain needs: `LatLng`, `MercatorPoint`, `TileCoord`, `PixelPoint`,
`BoundingBox`, and `SupportedLayerFormat`. No logic — types only.

## Target
`packages/km-map/src/types.ts` exports all map types. Package builds cleanly.

## Dependencies
- Page 00-01 (monorepo-setup)
- Page 00-02 (shared-types)
- Page 02-01 (geojson-types) — `GeoJsonPolygon` is used by `polygonArea`

## Inputs
- `DT-Map.md` — complete type definitions.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-map/src/types.ts` | All map types |
| `packages/km-map/src/index.ts` | Public re-exports |
| `packages/km-map/package.json` | Package manifest |
| `packages/km-map/tsconfig.json` | Extends root config |
| `packages/km-map/tsup.config.ts` | Build config |
| `packages/km-map/help.md` | Documentation stub |
| `packages/km-map/CHANGELOG.md` | Version history |

## Step-by-Step Instructions

1. Create `packages/km-map/src/types.ts`. No Zod imports.
2. Define and export all types from `DT-Map.md`:
   - `LatLng` — `{ lat: number; lng: number }` with JSDoc (−90 to +90, −180 to +180).
   - `MercatorPoint` — `{ x: number; y: number }` (meters from prime meridian/equator).
   - `TileCoord` — `{ x: number; y: number; z: number }`.
   - `PixelPoint` — `{ x: number; y: number }`.
   - `BoundingBox` — `[number, number, number, number]` tuple (`[west, south, east, north]`).
   - `SupportedLayerFormat` — the 9-variant string literal union from `DT-Map.md`.
3. Export all from `index.ts`.
4. Create package files (`package.json` with `@komeilm76/km-geojson` dependency,
   `tsconfig.json`, `tsup.config.ts`, `help.md` stub, `CHANGELOG.md`, `README.md`).
5. Build and run Zod-leak check.

## Acceptance Criteria

- [ ] All 6 types exported from `types.ts`
- [ ] `LatLng` has JSDoc noting valid ranges
- [ ] `BoundingBox` tuple is `[west, south, east, north]`
- [ ] `SupportedLayerFormat` has all 9 variants
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `BoundingBox` here is `[west, south, east, north]` — the geographic convention.
  This is different from the artboard package's internal bounding box
  `[minX, minY, maxX, maxY]`, which is a canvas convention. Both use 4-number
  tuples but mean different things. JSDoc must be explicit.
