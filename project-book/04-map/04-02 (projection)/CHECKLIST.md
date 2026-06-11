# Checklist — Page 04-02 Map Projections

- [x] `projection.ts` created
- [x] `latLngToMercator` exported — uses WGS84 radius (6378137 m)
- [x] `mercatorToLatLng` exported — reverse of `latLngToMercator`
- [x] `latLngToPixel` exported — correct pixel space formula
- [x] `pixelToLatLng` exported — reverse of `latLngToPixel`
- [x] JSDoc with `@example` on all 4 functions
- [x] All 4 functions exported from `index.ts`
- [x] Round-trip test: `mercatorToLatLng(latLngToMercator(p)) ≈ p`
- [x] Round-trip test: `pixelToLatLng(latLngToPixel(p, z), z) ≈ p`
- [x] Known value: `latLngToMercator({ lat: 0, lng: 0 })` → `{ x: 0, y: 0 }`
- [x] Known value: zoom 0 center → pixel `{ x: 128, y: 128 }`
- [x] Tests use `toBeCloseTo` for floating-point comparisons
- [x] All tests pass
- [x] `pnpm --filter @yourscope/map build` succeeds
- [x] `grep -rn "^import.*zod" packages/map/dist/` returns empty
