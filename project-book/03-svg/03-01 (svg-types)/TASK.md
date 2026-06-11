# Page 03-01 — SVG Types

## Summary
Creates the `@yourscope/svg` package skeleton and defines every TypeScript type
for SVG content: `SvgViewBox`, `SvgLength`, `SvgColor`, `SvgTransform`,
`SvgPresentationAttributes`, `SvgCoreAttributes`, all element types, `SvgElement`
union, and `SvgDocument`. No Zod, no parsing logic — types only.

## Target
`packages/svg/src/types.ts` exports all SVG types.
The package skeleton builds cleanly.

## Dependencies
- Page 00-01 (monorepo-setup)
- Page 00-02 (shared-types)

## Inputs
- `DT-SVG.md` — complete type definitions for every SVG concept.

## Outputs

| File | Purpose |
|---|---|
| `packages/svg/src/types.ts` | All SVG TypeScript types |
| `packages/svg/src/index.ts` | Public re-exports |
| `packages/svg/package.json` | Package manifest |
| `packages/svg/tsconfig.json` | Extends root config |
| `packages/svg/tsup.config.ts` | Build config |
| `packages/svg/help.md` | Documentation stub |
| `packages/svg/CHANGELOG.md` | Version history |
| `packages/svg/README.md` | npm display page |

## Step-by-Step Instructions

1. Create `packages/svg/src/types.ts`. No Zod imports.

2. Define `SvgViewBox`:
   `{ minX: number; minY: number; width: number; height: number }`.

3. Define `SvgLengthUnit` as the union of all 14 unit strings:
   `"px" | "pt" | "pc" | "mm" | "cm" | "in" | "em" | "ex" | "rem" | "vw" | "vh" | "%" | ""`.
   Define `SvgLength` as `{ value: number; unit: SvgLengthUnit }`.

4. Define `SvgColor` as a 5-variant discriminated union:
   `{ type: "hex"; value: string }`,
   `{ type: "rgb"; r: number; g: number; b: number }`,
   `{ type: "rgba"; r: number; g: number; b: number; a: number }`,
   `{ type: "named"; value: string }`,
   `{ type: "none" }`.

5. Define `SvgTransformOperation` as a 6-variant discriminated union
   (translate, scale, rotate, skewX, skewY, matrix).
   Define `SvgTransform` as `SvgTransformOperation[]`.

6. Define `SvgPresentationAttributes` with all 16 optional fields from
   `DT-SVG.md`. Use `SvgColor` for fill/stroke, `SvgLength` for strokeWidth,
   `number` for opacity values.

7. Define `SvgCoreAttributes` with `id?`, `className?`, `style?`,
   `transform?: SvgTransform`, and `"data-*"?: Record<string, string>`.

8. Define all 9 element types (each intersects `SvgCoreAttributes & SvgPresentationAttributes`):
   - `SvgPathElement` — `type: "path"`, `d: string`.
   - `SvgRectElement` — `type: "rect"`, `x`, `y`, `width`, `height`, optional `rx`, `ry`.
   - `SvgCircleElement` — `type: "circle"`, `cx`, `cy`, `r`.
   - `SvgEllipseElement` — `type: "ellipse"`, `cx`, `cy`, `rx`, `ry`.
   - `SvgLineElement` — `type: "line"`, `x1`, `y1`, `x2`, `y2`.
   - `SvgPolylineElement` — `type: "polyline"`, `points: [number, number][]`.
   - `SvgPolygonElement` — `type: "polygon"`, `points: [number, number][]`.
   - `SvgTextElement` — `type: "text"`, `x`, `y`, `content: string`,
     optional `fontSize`, `fontFamily`, `fontWeight`, `textAnchor`.
   - `SvgGroupElement` — `type: "g"`, `children: SvgElement[]` (recursive).

9. Define `SvgElement` as the union of all 9 element types.

10. Define `SvgPathCommand` as the 13-variant discriminated union on `cmd`
    (M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z).

11. Define `SvgDocument`:
    ```ts
    type SvgDocument = {
      viewBox?: SvgViewBox;
      width?: SvgLength;
      height?: SvgLength;
      elements: SvgElement[];
    };
    ```

12. Define `SvgGeoMeta` (used in the SVG→GeoJSON conversion):
    ```ts
    type SvgGeoMeta = {
      svgBounds: { minX: number; minY: number; maxX: number; maxY: number };
      geoBounds: [number, number, number, number];
      crs?: string;
    };
    ```

13. Export all types from `index.ts`.
14. Create package files and build.

## Acceptance Criteria

- [ ] All types exported from `types.ts` — no Zod imports
- [ ] `SvgColor` has all 5 variants with correct discriminant field
- [ ] `SvgTransformOperation` has all 6 variants
- [ ] `SvgGroupElement.children` is `SvgElement[]` (recursive)
- [ ] `SvgPathCommand` has all path command variants
- [ ] `SvgDocument` exports all 4 fields
- [ ] `SvgGeoMeta` exported
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `SvgGroupElement` creates a recursive type through `SvgElement[]`. TypeScript
  handles this correctly for type definitions. The Zod schema (next page) will
  need `z.lazy()`.
- The `"data-*"` field on `SvgCoreAttributes` is not a real index signature —
  it is a convention to signal that arbitrary `data-` attributes are allowed.
  Use `Record<string, string>` to type the map of custom data attributes.
- `SvgPathCommand` uses `cmd` as the discriminant because SVG path commands are
  single/double letters, not words. All variants share `cmd`.
