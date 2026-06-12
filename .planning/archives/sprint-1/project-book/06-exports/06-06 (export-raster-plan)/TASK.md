# Page 06-06 — Export to Raster Plan

## Summary
Implements `exportToRasterPlan` — converts artboard content into a
`RasterExportPlan` containing ordered draw instructions that a consumer can
execute against a canvas API to produce a PNG or JPEG image. This function never
touches a canvas itself.

## Target
`packages/km-exports/src/exportToRasterPlan.ts` exports `exportToRasterPlan`.
All 4 instruction types are generated correctly. Tests pass.

## Dependencies
- Page 06-02 (export-svg) — `applyExportFilter`
- Page 06-01 (export-types) — `RasterExportPlan`, `RasterDrawInstruction`

## Inputs
- `DT-Exports.md` — `exportToRasterPlan` spec, `RasterExportPlan`,
  `RasterDrawInstruction` union.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-exports/src/exportToRasterPlan.ts` | `exportToRasterPlan` implementation |
| `packages/km-exports/tests/exportToRasterPlan.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-exports/src/exportToRasterPlan.ts`.

2. Function signature:
   ```ts
   function exportToRasterPlan(
     artboard: Artboard,
     elements: SvgElement[],
     format: "png" | "jpeg",
     scale?: number,
     filter?: ExportFilter
   ): Result<RasterExportPlan>
   ```

3. Apply defaults: `scale = scale ?? 1`.

4. Apply `applyExportFilter(elements, filter)`.
5. If filtered result is empty, return `"empty-export"` error.

6. Compute canvas dimensions:
   ```ts
   const canvasWidth  = Math.round(artboard.size.width  * scale);
   const canvasHeight = Math.round(artboard.size.height * scale);
   ```

7. Walk each element and produce `RasterDrawInstruction` objects.
   Implement a private `elementToInstructions(el: SvgElement, scale: number): RasterDrawInstruction[]`:

   - `SvgRectElement` → `{ type: "rect", x: x*scale, y: y*scale, w: width*scale, h: height*scale, fill, stroke, strokeWidth }`.
   - `SvgCircleElement` → `{ type: "circle", cx: cx*scale, cy: cy*scale, r: r*scale, fill, stroke }`.
   - `SvgPathElement` → `{ type: "path", d: scaledPathD, fill, stroke, strokeWidth }`.
     Scale the path by creating a transform prefix: `scale(${scale})` prepended to `d`.
     A simpler approach: wrap as `{ type: "path", d: element.d, fill, stroke }` and
     note in JSDoc that the consumer must apply the scale transform.
   - `SvgTextElement` → `{ type: "text", x: x*scale, y: y*scale, content, font, fill }`.
     Construct `font` as `"${fontSize ?? 12}px ${fontFamily ?? 'sans-serif'}"`.
   - `SvgGroupElement` → flatten children: return all children's instructions
     with transforms applied.
   - `SvgLineElement`, `SvgPolylineElement`, `SvgPolygonElement` → convert to
     a `path` instruction using serialized SVG path data.

8. Build and return:
   ```ts
   return {
     success: true,
     data: {
       canvasWidth,
       canvasHeight,
       background: "#ffffff",
       instructions,
       format,
       quality: format === "jpeg" ? 0.92 : undefined,
     },
   };
   ```

9. Write tests:
   - `SvgRectElement` produces a `"rect"` instruction with scaled dimensions.
   - `SvgCircleElement` produces a `"circle"` instruction.
   - `SvgTextElement` produces a `"text"` instruction with `font` string.
   - `scale: 2` doubles all coordinate values.
   - `scale: 1` (default) preserves values.
   - `"empty-export"` when filter removes all elements.
   - `format: "jpeg"` → `quality: 0.92` in output.
   - `format: "png"` → `quality` is `undefined` in output.

## Acceptance Criteria

- [x] `exportToRasterPlan` returns `Result<RasterExportPlan>`
- [x] Canvas dimensions are `artboard.size * scale` (rounded to integer)
- [x] All 4 instruction types produced correctly
- [x] Scale is applied to all coordinate values
- [x] Default `scale` is `1`
- [x] `quality: 0.92` for JPEG, `undefined` for PNG
- [x] `background` defaults to `"#ffffff"`
- [x] `"empty-export"` error when all elements filtered out
- [x] All tests pass, build clean

## Notes
- This function does NOT import or use `HTMLCanvasElement`, `CanvasRenderingContext2D`,
  or any browser canvas API. It only produces instructions. This is the entire point
  of the design — the core library has zero DOM dependency.
- For path scaling, the simplest correct approach is to prepend a `scale(N)` transform
  to the SVG path `d` string. The consumer's canvas renderer applies this during
  drawing. Document this in JSDoc.
- `SvgGroupElement` transform handling: if the group has a `transform`, apply it
  to all child coordinates. For the raster plan, this is an approximation — only
  `translate` and `scale` are easily composable. Note this limitation in JSDoc.
