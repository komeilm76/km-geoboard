# Page 02-02 — GeoJSON Zod Schemas

## Summary
Creates `packages/km-geojson/src/schemas.ts` — Zod v4 schemas for every GeoJSON
type. The geometry collection schema must use `z.lazy()` to handle the recursive
`GeoJsonGeometry` reference. Every schema must include the RFC 7946 validation
rules: minimum positions, ring closure, bounding-box ordering.

## Target
`packages/km-geojson/src/schemas.ts` exports all schemas.
Type-divergence guards confirm every schema matches its hand-written type.
The package builds cleanly. No Zod in `dist/`.

## Dependencies
- Page 00-03 (zod-utils) — `finiteNumber()`, `boundingBoxSchema()`
- Page 02-01 (geojson-types) — all GeoJSON types must exist

## Inputs
- `DT-GeoJSON.md` — validation rules, schema examples (including the lazy pattern
  for `GeoJsonGeometrySchema`).
- `DT-Zod.md` — schema naming convention, `safeParse` pattern, type-check assertion.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-geojson/src/schemas.ts` | All GeoJSON Zod schemas |
| `packages/km-geojson/src/index.ts` | Updated to re-export schemas |

## Step-by-Step Instructions

1. Create `packages/km-geojson/src/schemas.ts`.
   Import `z` from `'zod'` and utilities from `@komeilm76/km-shared`.

2. Define `PositionSchema`:
   ```ts
   export const PositionSchema = z.union([
     z.tuple([z.number(), z.number()]),
     z.tuple([z.number(), z.number(), z.number()]),
   ]);
   ```

3. Define `BoundingBoxSchema` (4-element and 6-element variants, with
   west ≤ east and south ≤ north refinement).

4. Define `LinearRingSchema`:
   - Minimum 4 positions.
   - First and last position must be equal (closed ring).
   - Use `.refine()` to check closure:
     ```ts
     .refine(ring => {
       const first = ring[0];
       const last  = ring[ring.length - 1];
       return first[0] === last[0] && first[1] === last[1];
     }, { message: "Linear ring must be closed (first === last position)" })
     ```

5. Define individual geometry schemas:
   - `GeoJsonPointSchema` — `z.object({ type: z.literal("Point"), coordinates: PositionSchema, bbox: ... })`
   - `GeoJsonMultiPointSchema`
   - `GeoJsonLineStringSchema` — coordinates must have `z.array(...).min(2)`
   - `GeoJsonMultiLineStringSchema`
   - `GeoJsonPolygonSchema` — coordinates is `z.array(LinearRingSchema).min(1)`
   - `GeoJsonMultiPolygonSchema`
   - `GeoJsonGeometryCollectionSchema` — stub first, fill with `z.lazy()` below.

6. Define the recursive `GeoJsonGeometrySchema` using `z.lazy()`:
   ```ts
   export const GeoJsonGeometrySchema: z.ZodType<GeoJsonGeometry> = z.lazy(() =>
     z.discriminatedUnion("type", [
       GeoJsonPointSchema,
       GeoJsonMultiPointSchema,
       GeoJsonLineStringSchema,
       GeoJsonMultiLineStringSchema,
       GeoJsonPolygonSchema,
       GeoJsonMultiPolygonSchema,
       GeoJsonGeometryCollectionSchema,
     ])
   );
   ```
   Then patch `GeoJsonGeometryCollectionSchema` to use this lazy reference.

7. Define `GeoJsonFeatureSchema`:
   - `geometry: GeoJsonGeometrySchema.nullable()`
   - `properties: z.record(z.string(), z.unknown()).nullable()`
   - Optional `id: z.union([z.string(), z.number()]).optional()`
   - Optional `bbox`.

8. Define `GeoJsonFeatureCollectionSchema`:
   - `features: z.array(GeoJsonFeatureSchema)`
   - Optional `bbox`.

9. Define `GeoJsonSchema` as the root union over geometry, feature, and
   feature-collection schemas.

10. Add type-divergence guards for at least:
    `GeoJsonGeometry`, `GeoJsonFeature`, `GeoJsonFeatureCollection`.

11. Export all schemas (the base schemas, not just the top-level ones) from
    `index.ts`. Consumers may need `PositionSchema`, `LinearRingSchema`, etc.

12. Build and run the Zod-leak check.

## Acceptance Criteria

- [ ] All schemas defined and exported
- [ ] `LinearRingSchema` validates ring closure (first === last)
- [ ] `LinearRingSchema` validates minimum 4 positions
- [ ] `GeoJsonLineStringSchema` validates minimum 2 positions
- [ ] `GeoJsonGeometrySchema` uses `z.lazy()` for recursive geometry collection
- [ ] `GeoJsonFeatureSchema` allows `null` geometry and `null` properties
- [ ] `BoundingBoxSchema` validates west ≤ east and south ≤ north
- [ ] Type-divergence guards compile without error
- [ ] Build succeeds
- [ ] `grep -rn "^import.*zod" packages/km-geojson/dist/` returns empty

## Notes
- The `z.lazy()` pattern defers evaluation of the recursive reference. Without it,
  `GeoJsonGeometryCollectionSchema` would reference `GeoJsonGeometrySchema` before
  it is defined, causing a runtime error.
- `z.discriminatedUnion("type", [...])` is significantly faster than `z.union()`
  for a union discriminated on a literal field — always prefer it here.
- The `GeoJsonGeometrySchema` type annotation `z.ZodType<GeoJsonGeometry>` is
  required when using `z.lazy()` — TypeScript cannot infer the type through the
  lazy boundary without it.
- Keep schemas in `schemas.ts` and never in `types.ts`. The `types.ts` file
  must remain Zod-free so the declaration files it produces never pull in Zod.
