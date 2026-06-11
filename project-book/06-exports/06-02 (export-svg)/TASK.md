# Page 06-02 — Export to SVG

## Summary
Implements `exportToSvg` — serializes artboard content and SVG elements back
into an SVG XML string. This is the primary round-trip partner of `importSvg`.
The filter pipeline is also implemented here as a shared utility used by all
export functions.

## Target
`packages/exports/src/exportToSvg.ts` and `packages/exports/src/filter.ts`
exist, are exported, and all tests pass.

## Dependencies
- Page 06-01 (export-types)
- Page 03-01 (svg-types) — `SvgElement`, `SvgDocument`

## Inputs
- `DT-Exports.md` — `exportToSvg` spec, filter application order (5 steps).
- `DT-SVG.md` — element types for serialization.

## Outputs

| File | Purpose |
|---|---|
| `packages/exports/src/filter.ts` | `applyExportFilter` — shared filter utility |
| `packages/exports/src/exportToSvg.ts` | `exportToSvg` implementation |
| `packages/exports/tests/filter.test.ts` | Filter utility tests |
| `packages/exports/tests/exportToSvg.test.ts` | SVG export tests |

## Step-by-Step Instructions

### `filter.ts`
1. Create `packages/exports/src/filter.ts`.
2. Implement `applyExportFilter<T extends { id?: string }>(items: T[], filter?: ExportFilter): T[]`.
   Apply filters in the exact order specified in `DT-Exports.md`:
   1. If `includeIds` is set and non-empty, keep only items whose `id` is in the set.
   2. Remove items whose `id` is in `excludeIds`.
   3. Keep only items whose layer matches `includeLayers` (if set and non-empty).
   4. Remove items whose layer matches `excludeLayers`.
   5. Apply `boundingBox` — keep only items that intersect the box.
      For step 5: if an item has no geometry/coordinates, keep it (conservative).
3. If `filter` is `undefined`, return `items` unchanged.
4. Export `applyExportFilter` from `index.ts`.

### `exportToSvg`
5. Create `packages/exports/src/exportToSvg.ts`.
6. Function: `exportToSvg(options: SvgExportOptions): Result<string>`.
7. Destructure options with defaults:
   ```ts
   const {
     artboard, elements, filter,
     inlineAssets = false,
     xmlDeclaration = true,
     pretty = false,
   } = options;
   ```
8. Apply `applyExportFilter(elements, filter)`.
9. If filtered result is empty, return `{ success: false, error: { code: "empty-export" } }`.
10. Build the SVG string:
    - Opening `<svg>` tag with `xmlns`, `viewBox`, optional `width`/`height` from artboard.
    - Serialize each element to its SVG tag using a recursive `serializeElement` helper.
    - Closing `</svg>` tag.
    - Optionally prepend XML declaration (`<?xml version="1.0" encoding="UTF-8"?>`).
    - Apply `pretty` formatting (indentation) if requested.
11. Return `{ success: true, data: svgString }`.
12. Implement `serializeElement(el: SvgElement): string`:
    - For each element type, produce the correct SVG tag with all attributes.
    - Handle `SvgGroupElement` recursively (children inside `<g>...</g>`).
    - Serialize `SvgColor` to CSS color strings (hex → `#rrggbb`, rgb → `rgb()`, etc.).
    - Serialize `SvgTransform` using `serializeSvgPath`-style output for transform strings.

13. Write tests:
    - Round-trip: `importSvg(exportToSvg({ artboard, elements }).data!)` returns
      the same elements (test in the imports package or here with a test dep).
    - `"empty-export"` error when all elements are filtered out.
    - `xmlDeclaration: true` prepends the XML declaration.
    - `pretty: true` adds indentation.
    - All 9 element types serialize without error.
    - Filter is applied correctly (verifiable by checking the output string).

## Acceptance Criteria

- [ ] `applyExportFilter` applies all 5 steps in the correct order
- [ ] `applyExportFilter` returns items unchanged when `filter` is undefined
- [ ] `exportToSvg` produces valid SVG with correct `viewBox`
- [ ] All 9 element types serialized correctly
- [ ] `SvgGroupElement` children serialized recursively
- [ ] `"empty-export"` returned when all elements are filtered out
- [ ] `xmlDeclaration` and `pretty` options work correctly
- [ ] All tests pass
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `serializeElement` should be a private helper (not exported). It only needs
  to produce syntactically correct SVG — it does not need to be a perfect inverse
  of the SVG parser (e.g., it can always output `transform="matrix(...)"` even if
  the original used `translate()`).
- For `SvgColor` serialization: `{ type: "none" }` → `"none"`, `{ type: "hex" }` →
  the hex string, `{ type: "rgb" }` → `"rgb(r, g, b)"`, etc.
- `pretty` formatting can use 2-space indentation. Track nesting depth as
  `serializeElement` recurses into groups.
