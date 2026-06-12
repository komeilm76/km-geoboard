# Page 04-02 — Map Projections

## Summary
Implements `latLngToMercator`, `mercatorToLatLng`, `latLngToPixel`, and
`pixelToLatLng` — the four coordinate-system conversion functions.
Each forward function has a paired reverse. All are pure math with no external
dependencies beyond `@komeilm76/km-shared`.

## Target
`packages/km-map/src/projection.ts` exports all 4 functions with tests.
Round-trip invariants pass within floating-point tolerance.

## Dependencies
- Page 04-01 (map-types)

## Inputs
- `DT-Map.md` — function specs, Web Mercator formula, pixel coordinate formula.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-map/src/projection.ts` | All 4 projection functions |
| `packages/km-map/tests/projection.test.ts` | Round-trip and known-value tests |

## Step-by-Step Instructions

1. Create `packages/km-map/src/projection.ts`.

2. Implement `latLngToMercator(latLng: LatLng): MercatorPoint`:
   ```ts
   const R = 6378137; // WGS84 earth radius in meters
   const x = R * (latLng.lng * Math.PI / 180);
   const y = R * Math.log(Math.tan(Math.PI / 4 + (latLng.lat * Math.PI / 180) / 2));
   return { x, y };
   ```

3. Implement `mercatorToLatLng(point: MercatorPoint): LatLng`:
   ```ts
   const R = 6378137;
   const lng = (point.x / R) * (180 / Math.PI);
   const lat = (2 * Math.atan(Math.exp(point.y / R)) - Math.PI / 2) * (180 / Math.PI);
   return { lat, lng };
   ```

4. Implement `latLngToPixel(latLng: LatLng, zoom: number): PixelPoint`:
   - Global pixel space at zoom level `z` is `256 * 2^z` × `256 * 2^z`.
   - Convert `latLng` to Mercator, then scale to pixel space.
   ```ts
   const scale = 256 * Math.pow(2, zoom);
   const { x: mx, y: my } = latLngToMercator(latLng);
   const maxMerc = Math.PI * 6378137;
   const px = (mx + maxMerc) / (2 * maxMerc) * scale;
   const py = (maxMerc - my) / (2 * maxMerc) * scale;
   return { x: px, y: py };
   ```

5. Implement `pixelToLatLng(pixel: PixelPoint, zoom: number): LatLng` — reverse.

6. Add JSDoc with `@param`, `@returns`, `@example` to all 4 functions.
7. Export all 4 from `packages/km-map/src/index.ts`.

8. Write `tests/projection.test.ts`:
   - `latLngToMercator` / `mercatorToLatLng` round-trip for several points
     (equator, poles, prime meridian, date line).
   - Known value: `latLngToMercator({ lat: 0, lng: 0 })` → `{ x: 0, y: 0 }`.
   - `latLngToPixel` / `pixelToLatLng` round-trip at zoom 0, 10, 20.
   - Known value: at zoom 0, `{ lat: 0, lng: 0 }` → `{ x: 128, y: 128 }` (center of 256×256).
   - Use `expect(value).toBeCloseTo(expected, 5)` for floating-point comparisons.

## Acceptance Criteria

- [x] `latLngToMercator` and `mercatorToLatLng` are perfect round-trips
- [x] `latLngToPixel` and `pixelToLatLng` are perfect round-trips
- [x] Known values match expected outputs (origin → origin, center at zoom 0)
- [x] Floating-point comparisons use `toBeCloseTo` with sufficient precision
- [x] All 4 functions exported from `index.ts`
- [x] JSDoc with examples on every function
- [x] All tests pass
- [x] Build succeeds, Zod-leak check passes

## Notes
- The Web Mercator projection clips latitude at approximately ±85.0511 degrees.
  Values beyond this range produce `Infinity` or `NaN`. The functions do not
  guard against this — document it in JSDoc as a known limitation.
- Reversibility is the primary correctness test here. Any correct implementation
  must satisfy `mercatorToLatLng(latLngToMercator(p)) ≈ p` for all valid inputs.
