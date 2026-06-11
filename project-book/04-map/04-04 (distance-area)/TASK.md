# Page 04-04 — Distance and Area

## Summary
Implements `haversineDistance`, `rhumbDistance`, `bearing`, `destinationPoint`,
and `polygonArea` — geographic math functions for measuring and navigating
the Earth's surface.

## Target
`packages/map/src/distance.ts` exports all 5 functions with tests.
`polygonArea` uses `GeoJsonPolygon` from `@yourscope/geojson`.

## Dependencies
- Page 04-01 (map-types)
- Page 02-01 (geojson-types)

## Inputs
- `DT-Map.md` — full function specs including the Haversine formula example.

## Outputs

| File | Purpose |
|---|---|
| `packages/map/src/distance.ts` | All 5 distance/bearing/area functions |
| `packages/map/tests/distance.test.ts` | Tests with known geographic values |

## Step-by-Step Instructions

1. Create `packages/map/src/distance.ts`.
   Define a module-level constant: `const R = 6378137;` (WGS84 radius in meters).

2. Implement `haversineDistance(from: LatLng, to: LatLng): number`:
   ```ts
   const φ1 = from.lat * Math.PI / 180;
   const φ2 = to.lat   * Math.PI / 180;
   const Δφ = (to.lat - from.lat) * Math.PI / 180;
   const Δλ = (to.lng - from.lng) * Math.PI / 180;
   const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   return R * c; // meters
   ```

3. Implement `rhumbDistance(from: LatLng, to: LatLng): number` (constant-bearing line).

4. Implement `bearing(from: LatLng, to: LatLng): number` (initial bearing in degrees 0–360):
   ```ts
   const y = Math.sin(Δλ) * Math.cos(φ2);
   const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
   return ((Math.atan2(y, x) * 180/Math.PI) + 360) % 360;
   ```

5. Implement `destinationPoint(origin: LatLng, bearing: number, distance: number): LatLng`
   (inverse of bearing + distance → destination).

6. Implement `polygonArea(polygon: GeoJsonPolygon): number`:
   Use the spherical excess formula for the exterior ring. Subtract areas of
   interior rings (holes). Return area in square meters.

7. Add full JSDoc with known-value examples.

8. Write tests with known geographic values:
   - London → Paris haversine distance ≈ 340,000 m (±1%).
   - Point to itself → distance 0.
   - Due-north bearing = 0°, due-east = 90°.
   - `destinationPoint` round-trip: `bearing(a, dest) ≈ original_bearing` and
     `haversineDistance(a, dest) ≈ original_distance`.
   - `polygonArea` for a known 1°×1° square near equator ≈ 12,300 km².

## Acceptance Criteria

- [ ] `haversineDistance` returns meters, correct Haversine formula
- [ ] `bearing` returns 0–360 degrees, 0 = north
- [ ] `destinationPoint` is inverse of `bearing` + distance
- [ ] `polygonArea` handles exterior ring and interior rings (holes)
- [ ] Known-value tests pass within 1% tolerance
- [ ] All 5 functions exported
- [ ] All tests pass, build clean

## Notes
- Use `Math.atan2` not `Math.asin` in Haversine — more numerically stable.
- `destinationPoint` and `bearing` / `haversineDistance` form a reversibility pair.
  Test: given `a`, compute destination `b` at bearing `θ` and distance `d`.
  Then verify `bearing(a, b) ≈ θ` and `haversineDistance(a, b) ≈ d`.
