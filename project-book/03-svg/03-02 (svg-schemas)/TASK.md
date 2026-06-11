# Page 03-02 — SVG Zod Schemas

## Summary
Creates `packages/svg/src/schemas.ts` — Zod v4 schemas for all SVG types.
`SvgGroupElement` contains `children: SvgElement[]`, so the element schemas
require a `z.lazy()` recursive reference. Type-divergence guards confirm
every schema matches its hand-written type.

## Target
`packages/svg/src/schemas.ts` exports all SVG schemas.
Type guards pass. Build is clean. No Zod in `dist/`.

## Dependencies
- Page 00-03 (zod-utils)
- Page 03-01 (svg-types)

## Inputs
- `DT-SVG.md` — all type definitions and field constraints.
- `DT-Zod.md` — `z.lazy()` for recursive types, naming conventions.

## Outputs

| File | Purpose |
|---|---|
| `packages/svg/src/schemas.ts` | All SVG Zod schemas |
| `packages/svg/src/index.ts` | Updated to re-export schemas |

## Step-by-Step Instructions

1. Create `packages/svg/src/schemas.ts`.

2. Define `SvgViewBoxSchema`:
   Four finite numbers: `minX`, `minY`, `width`, `height`.

3. Define `SvgLengthUnitSchema` as `z.enum([...all 14 units...])`.
   Define `SvgLengthSchema` as `z.object({ value: finiteNumber(), unit: SvgLengthUnitSchema })`.

4. Define `SvgColorSchema` using `z.discriminatedUnion("type", [...])`:
   - `hex`: `{ type: z.literal("hex"), value: z.string().regex(/^#([0-9a-fA-F]{3,6})$/) }`
   - `rgb`: `{ type: z.literal("rgb"), r: z.number().min(0).max(255), ... }`
   - `rgba`: same with `a: opacitySchema()`
   - `named`: `{ type: z.literal("named"), value: z.string().min(1) }`
   - `none`: `{ type: z.literal("none") }`

5. Define `SvgTransformOperationSchema` using `z.discriminatedUnion("type", [...])`:
   - `translate`: `tx`, `ty` as finite numbers.
   - `scale`: `sx`, `sy`.
   - `rotate`: `angle`, optional `cx`, `cy`.
   - `skewX` / `skewY`: `angle`.
   - `matrix`: `a`, `b`, `c`, `d`, `e`, `f` all finite.
   Define `SvgTransformSchema` as `z.array(SvgTransformOperationSchema)`.

6. Define `SvgPresentationAttributesSchema` with all 16 optional fields.
   Use `SvgColorSchema` for fill/stroke, `SvgLengthSchema` for strokeWidth, etc.

7. Define `SvgCoreAttributesSchema` with optional `id`, `className`, `style`,
   `transform: SvgTransformSchema.optional()`.

8. Define the base shared attributes schema:
   ```ts
   const SvgBaseSchema = SvgCoreAttributesSchema.merge(SvgPresentationAttributesSchema);
   ```

9. Define individual element schemas (each extends `SvgBaseSchema`):
   - `SvgPathElementSchema`: `type: z.literal("path")`, `d: z.string()`.
   - `SvgRectElementSchema`: `type: z.literal("rect")`, `x`, `y`, `width`, `height`,
     optional `rx`, `ry` as finite numbers.
   - `SvgCircleElementSchema`, `SvgEllipseElementSchema`, `SvgLineElementSchema`.
   - `SvgPolylineElementSchema`: `points: z.array(z.tuple([finiteNumber(), finiteNumber()]))`.
   - `SvgPolygonElementSchema`: same.
   - `SvgTextElementSchema`: `x`, `y`, `content: z.string()`, optional text fields.
   - `SvgGroupElementSchema`: stub with a placeholder `children` field — fill with lazy below.

10. Define the recursive `SvgElementSchema`:
    ```ts
    export const SvgElementSchema: z.ZodType<SvgElement> = z.lazy(() =>
      z.discriminatedUnion("type", [
        SvgPathElementSchema,
        SvgRectElementSchema,
        SvgCircleElementSchema,
        SvgEllipseElementSchema,
        SvgLineElementSchema,
        SvgPolylineElementSchema,
        SvgPolygonElementSchema,
        SvgTextElementSchema,
        SvgGroupElementSchema,
      ])
    );
    ```
    Patch `SvgGroupElementSchema` to use `z.array(SvgElementSchema)` for children.

11. Define `SvgDocumentSchema`:
    ```ts
    export const SvgDocumentSchema = z.object({
      viewBox:  SvgViewBoxSchema.optional(),
      width:    SvgLengthSchema.optional(),
      height:   SvgLengthSchema.optional(),
      elements: z.array(SvgElementSchema),
    });
    ```

12. Add type-divergence guards for `SvgElement` and `SvgDocument`.
13. Export all schemas. Update `index.ts`.
14. Build and run Zod-leak check.

## Acceptance Criteria

- [ ] All schemas defined and exported
- [ ] `SvgColorSchema` uses discriminated union on `"type"` field
- [ ] `SvgTransformOperationSchema` uses discriminated union on `"type"` field
- [ ] `SvgElementSchema` uses `z.lazy()` for recursive group children
- [ ] `SvgElementSchema` has explicit type annotation `z.ZodType<SvgElement>`
- [ ] `SvgGroupElementSchema.children` uses the lazy `SvgElementSchema`
- [ ] Type-divergence guards compile without error
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `z.discriminatedUnion` requires every member to have the discriminant key.
  All SVG element types have `type` as a literal, so this works perfectly.
- For `SvgGroupElementSchema`, define the schema object first, then reassign or
  re-use the lazy reference for `children`. One clean approach:
  define a `SvgGroupElementSchemaShape` object with all fields except children,
  then combine with `z.array(SvgElementSchema)` after the lazy reference is set.
- `SvgPathCommand` schemas are defined in the next page alongside the parser —
  they are only needed in the context of path parsing.
