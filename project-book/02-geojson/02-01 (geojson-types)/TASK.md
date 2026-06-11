# Page 02-01 — GeoJSON Types

## Summary
Creates the `@yourscope/geojson` package and defines every TypeScript type
from RFC 7946: all geometry types, `Feature`, `FeatureCollection`, and the
helper types `Position`, `BoundingBox`, and `LinearRing`. No Zod schemas yet —
types only.

## Target
`packages/geojson/src/types.ts` exports all 14 GeoJSON types.
The package skeleton is in place and builds cleanly.

## Dependencies
- Page 00-01 (monorepo-setup)
- Page 00-02 (shared-types) — `Result<T>` must exist

## Inputs
- `DT-GeoJSON.md` — complete RFC 7946 type definitions, coordinate system note
  (longitude-first), validation rules (ring closure, minimum positions).

## Outputs

| File | Purpose |
|---|---|
| `packages/geojson/src/types.ts` | All GeoJSON TypeScript types |
| `packages/geojson/src/index.ts` | Public re-exports |
| `packages/geojson/package.json` | Package manifest |
| `packages/geojson/tsconfig.json` | Extends root config |
| `packages/geojson/tsup.config.ts` | Build config |
| `packages/geojson/help.md` | Documentation stub |
| `packages/geojson/CHANGELOG.md` | Version history |
| `packages/geojson/README.md` | npm display page |

## Step-by-Step Instructions

1. Create `packages/geojson/src/types.ts`. No Zod imports — types only.

2. Define in order:
   ```ts
   /** [longitude, latitude] or [longitude, latitude, altitude] */
   export type Position = [number, number] | [number, number, number];

   /** [west, south, east, north] or [west, south, minAlt, east, north, maxAlt] */
   export type BoundingBox =
     | [number, number, number, number]
     | [number, number, number, number, number, number];

   /** A closed linear ring — minimum 4 positions, first === last. */
   export type LinearRing = [Position, Position, Position, Position, ...Position[]];
   ```

3. Define all 7 geometry types:
   - `GeoJsonPoint` with `coordinates: Position`.
   - `GeoJsonMultiPoint` with `coordinates: Position[]`.
   - `GeoJsonLineString` with `coordinates: [Position, Position, ...Position[]]`
     (minimum 2 positions enforced at the type level).
   - `GeoJsonMultiLineString`.
   - `GeoJsonPolygon` with `coordinates: LinearRing[]`.
   - `GeoJsonMultiPolygon` with `coordinates: LinearRing[][]`.
   - `GeoJsonGeometryCollection` with `geometries: GeoJsonGeometry[]`.
   Each has `type: "LiteralString"` and optional `bbox?: BoundingBox`.

4. Define the `GeoJsonGeometry` union of all 7 geometry types.

5. Define `GeoJsonFeature<G, P>` with generics defaulting to
   `G = GeoJsonGeometry` and `P = Record<string, unknown>`.
   Fields: `type: "Feature"`, `geometry: G`, `properties: P`,
   optional `id?: string | number`, optional `bbox?: BoundingBox`.

6. Define `GeoJsonFeatureCollection<G, P>` with the same generics.
   Fields: `type: "FeatureCollection"`, `features: GeoJsonFeature<G, P>[]`,
   optional `bbox?: BoundingBox`.

7. Define `GeoJson` as the root union:
   `GeoJsonGeometry | GeoJsonFeature | GeoJsonFeatureCollection`.

8. Add JSDoc to every type explaining its RFC 7946 role. Include the critical
   coordinate-order note on `Position`: "longitude first, latitude second."

9. Create `packages/geojson/src/index.ts` exporting all 14 types.

10. Create `packages/geojson/package.json`:
    - `"name": "@yourscope/geojson"`, `"version": "0.1.0"`.
    - Dependency on `@yourscope/shared`.
    - `zod` as peerDependency and devDependency.
    - `check-zod` script.

11. Create `tsconfig.json`, `tsup.config.ts`, `help.md` stub, `CHANGELOG.md`, `README.md`.

12. Run `pnpm --filter @yourscope/geojson build`. Confirm success and empty Zod check.

## Acceptance Criteria

- [ ] All 14 types exported from `types.ts`
- [ ] `Position` is a tuple union (2-element or 3-element)
- [ ] `LinearRing` enforces minimum 4 positions at the type level
- [ ] `GeoJsonLineString.coordinates` enforces minimum 2 positions at the type level
- [ ] `GeoJsonGeometryCollection.geometries` is typed as `GeoJsonGeometry[]`
- [ ] `GeoJsonFeature` and `GeoJsonFeatureCollection` have generic type parameters
- [ ] `geometry` field on `GeoJsonFeature` accepts `null`
- [ ] `properties` field on `GeoJsonFeature` accepts `null`
- [ ] JSDoc on every type including the longitude-first note on `Position`
- [ ] Build succeeds with no TypeScript errors
- [ ] `grep -rn "^import.*zod" packages/geojson/dist/` returns empty

## Notes
- The **longitude-first** ordering of `Position` is a frequent source of bugs.
  Put a clear warning comment in the JSDoc: `// [longitude, latitude] — NOT [lat, lng]`.
- `GeoJsonGeometryCollection` creates a recursive type — `GeoJsonGeometry`
  includes `GeoJsonGeometryCollection`, which contains `GeoJsonGeometry[]`.
  TypeScript handles this fine for type definitions. The Zod schema (next page)
  needs `z.lazy()` to handle the recursion.
- `geometry: G` on `GeoJsonFeature` can be `null` per RFC 7946 — this represents
  a feature with no geometry. The type must allow `G extends GeoJsonGeometry | null`.
