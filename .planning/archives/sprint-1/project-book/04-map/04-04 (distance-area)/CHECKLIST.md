# Checklist — Page 04-04 Distance and Area

- [x] `distance.ts` created
- [x] `haversineDistance` exported — correct Haversine formula, returns meters
- [x] `rhumbDistance` exported
- [x] `bearing` exported — returns 0–360°, 0 = north
- [x] `destinationPoint` exported
- [x] `polygonArea` exported — accepts `GeoJsonPolygon`, returns square meters
- [x] `polygonArea` handles holes (interior rings)
- [x] All 5 functions exported from `index.ts`
- [x] JSDoc with known-value examples
- [x] Test: London → Paris ≈ 340,000 m (within 1%)
- [x] Test: same-point distance = 0
- [x] Test: due-north bearing = 0°
- [x] Test: `destinationPoint` round-trip with `bearing` + `haversineDistance`
- [x] Test: `polygonArea` known square near equator
- [x] Tests use appropriate tolerance (`toBeCloseTo` or percentage check)
- [x] All tests pass
- [x] `pnpm --filter @komeilm76/km-map build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-map/dist/` returns empty
