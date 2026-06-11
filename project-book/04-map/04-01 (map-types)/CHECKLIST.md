# Checklist — Page 04-01 Map Types

- [x] `packages/map/src/types.ts` created — no Zod imports
- [x] `LatLng` exported with `lat` and `lng` fields and range JSDoc
- [x] `MercatorPoint` exported with `x` and `y` fields
- [x] `TileCoord` exported with `x`, `y`, `z` fields
- [x] `PixelPoint` exported with `x` and `y` fields
- [x] `BoundingBox` exported as `[west, south, east, north]` tuple
- [x] `SupportedLayerFormat` exported with all 9 format literals
- [x] All types exported from `index.ts`
- [x] `packages/map/package.json` lists `@yourscope/shared` and `@yourscope/geojson` as dependencies
- [x] `packages/map/package.json` lists `zod` as peerDependency and devDependency
- [x] `packages/map/tsconfig.json` extends root config
- [x] `packages/map/tsup.config.ts` exists
- [x] `pnpm --filter @yourscope/map build` succeeds
- [x] `grep -rn "^import.*zod" packages/map/dist/` returns empty
- [x] `help.md` stub created
- [x] `CHANGELOG.md` has `## [0.1.0]` entry
