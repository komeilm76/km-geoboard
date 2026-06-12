# Page 03-04 — SVG to GeoJSON Conversion

## Summary
Implements `svgPointToGeoPosition`, `svgElementToGeoJsonFeature`, and
`svgDocumentToFeatureCollection` — the pipeline that maps SVG canvas coordinates
to real-world geographic positions and converts SVG shapes into GeoJSON features.

## Target
`packages/km-svg/src/svgToGeoJson.ts` exports all three conversion functions.
Tests pass for all SVG element types. `@komeilm76/km-geojson` is added as a
dependency of `@komeilm76/km-svg`.

## Dependencies
- Page 02-03 (geojson-parse) — `GeoJsonFeature`, `GeoJsonFeatureCollection`,
  `featureFromGeometry`, `collectionFromFeatures` from `@komeilm76/km-geojson`.
- Page 03-03 (svg-parse) — `parseSvgPath` for path element conversion.

## Inputs
- `DT-SVG.md` — `SvgGeoMeta`, `svgPointToGeoPosition` formula,
  element-to-geometry mapping table, y-axis inversion note.
- `DT-GeoJSON.md` — geometry types used as output.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-svg/src/svgToGeoJson.ts` | All 3 conversion functions |
| `packages/km-svg/tests/svgToGeoJson.test.ts` | Tests |
| `packages/km-svg/package.json` | Updated to depend on `@komeilm76/km-geojson` |

## Step-by-Step Instructions

1. Add `@komeilm76/km-geojson` as a dependency in `packages/km-svg/package.json`.

2. Create `packages/km-svg/src/svgToGeoJson.ts`.

3. Implement `svgPointToGeoPosition(point: [number, number], meta: SvgGeoMeta): [number, number]`:
   ```ts
   const [west, south, east, north] = meta.geoBounds;
   const svgW = meta.svgBounds.maxX - meta.svgBounds.minX;
   const svgH = meta.svgBounds.maxY - meta.svgBounds.minY;
   const lng = west  + (point[0] - meta.svgBounds.minX) / svgW * (east  - west);
   const lat = north - (point[1] - meta.svgBounds.minY) / svgH * (north - south);
   return [lng, lat];
   ```
   Note the y-axis inversion: SVG y increases downward, latitude increases upward.

4. Implement `svgElementToGeoJsonFeature(element: SvgElement, meta: SvgGeoMeta): Result<GeoJsonFeature>`.
   Handle each element type:

   - **`rect`**: Produce a closed 5-point `Polygon` ring:
     ```
     [x,y] → [x+w,y] → [x+w,y+h] → [x,y+h] → [x,y]
     ```
     Each corner is converted with `svgPointToGeoPosition`.

   - **`circle`**: Approximate with N=64 points on the circumference:
     ```ts
     for (let i = 0; i <= 64; i++) {
       const angle = (i / 64) * 2 * Math.PI;
       const px = cx + r * Math.cos(angle);
       const py = cy + r * Math.sin(angle);
       ring.push(svgPointToGeoPosition([px, py], meta));
     }
     ```

   - **`ellipse`**: Same as circle, using `rx` and `ry` separately.

   - **`line`**: Produce a 2-point `LineString`.

   - **`polyline`**: Produce a `LineString` from `points`.

   - **`polygon`**: Produce a closed `Polygon` ring from `points` (close by
     appending the first point at the end).

   - **`path`**: Parse `element.d` with `parseSvgPath`.
     Walk commands to collect points. If the path has `Z` commands creating
     closed sub-paths, produce a `Polygon` (or `MultiPolygon`).
     Otherwise produce a `LineString`.

   - **`text`**: Produce a `Point` at `[x, y]`.

   - **`g` (group)**: Recursively convert all children, collect results into a
     `GeometryCollection`.

   Store SVG presentation attributes (`fill`, `stroke`, `opacity`, etc.)
   in `Feature.properties`.

5. Implement `svgDocumentToFeatureCollection(doc: SvgDocument, meta: SvgGeoMeta): Result<GeoJsonFeatureCollection>`:
   - Convert every element in `doc.elements` with `svgElementToGeoJsonFeature`.
   - Collect successes; skip failures with a logged warning (do not short-circuit).
   - Wrap in a `FeatureCollection` using `collectionFromFeatures`.

6. Write `tests/svgToGeoJson.test.ts`:
   - `svgPointToGeoPosition`: verify origin maps to [west, north], extremes
     map to [east, south], and y-inversion is correct.
   - `svgElementToGeoJsonFeature`:
     - `rect` → 5-point closed Polygon ring.
     - `line` → 2-point LineString.
     - `circle` → Polygon with 65 points (64 + closing point).
     - `text` → Point.
     - `g` → GeometryCollection.
   - `svgDocumentToFeatureCollection`: single-element doc, multi-element doc.

## Acceptance Criteria

- [x] `svgPointToGeoPosition` implements the linear interpolation formula correctly
- [x] Y-axis is inverted (SVG y-down → lat y-up)
- [x] `rect` produces a closed 5-point `Polygon` ring
- [x] `circle` / `ellipse` approximated with 64 points
- [x] `line` / `polyline` produce `LineString`
- [x] `polygon` produces a closed `Polygon`
- [x] `text` produces a `Point`
- [x] `g` produces a `GeometryCollection`
- [x] SVG presentation attributes stored in `Feature.properties`
- [x] `svgDocumentToFeatureCollection` does not short-circuit on single-element failure
- [x] All tests pass
- [x] Build succeeds, Zod-leak check passes

## Notes
- The conversion from `path` to GeoJSON geometry is the hardest case. A minimal
  implementation handles only closed paths (with `Z`) → `Polygon` and open paths →
  `LineString`. Bezier curves are sampled at a fixed resolution (e.g. 20 points
  per curve segment) and linearized — this is a known approximation.
- `svgPointToGeoPosition` is the single most important function for correctness.
  Test it thoroughly: both axes, both directions, edge points, center point.
- Properties stored on the GeoJSON feature should use the SVG attribute names
  as keys (e.g., `"fill"`, `"stroke"`, `"opacity"`), serialized to plain strings.
