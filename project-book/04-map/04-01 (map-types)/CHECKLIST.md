# Checklist — Page 04-01 Map Types

- [x] `packages/km-map/src/types.ts` created — no Zod imports
- [x] `LatLng` exported with `lat` and `lng` fields and range JSDoc
- [x] `MercatorPoint` exported with `x` and `y` fields
- [x] `TileCoord` exported with `x`, `y`, `z` fields
- [x] `PixelPoint` exported with `x` and `y` fields
- [x] `BoundingBox` exported as `[west, south, east, north]` tuple
- [x] `SupportedLayerFormat` exported with all 9 format literals
- [x] All types exported from `index.ts`
- [x] `packages/km-map/package.json` lists `@komeilm76/km-shared` and `@komeilm76/km-geojson` as dependencies
- [x] `packages/km-map/package.json` lists `zod` as peerDependency and devDependency
- [x] `packages/km-map/tsconfig.json` extends root config
- [x] `packages/km-map/tsup.config.ts` exists
- [x] `pnpm --filter @komeilm76/km-map build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-map/dist/` returns empty
- [x] `help.md` stub created
- [x] `CHANGELOG.md` has `## [0.1.0]` entry
