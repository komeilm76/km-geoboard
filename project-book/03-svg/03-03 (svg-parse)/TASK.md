# Page 03-03 — SVG Parse Functions

## Summary
Implements `parseSvgDocument`, `parseSvgPath`, and `serializeSvgPath` — the
three functions that handle reading and writing SVG content as structured data.
These are pure string → data → string transformations with no DOM dependency.

## Target
`packages/km-svg/src/parseSvgDocument.ts`, `parseSvgPath.ts`, and
`serializeSvgPath.ts` all exist, are exported, and pass their tests.

## Dependencies
- Page 03-02 (svg-schemas)
- Page 02-01 (geojson-types) — `@komeilm76/km-geojson` is not a dep yet, but
  `@komeilm76/km-shared` `Result<T>` is needed.

## Inputs
- `DT-SVG.md` — full specs for `parseSvgDocument`, `parseSvgPath`,
  `serializeSvgPath`, `SvgPathCommand` types.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-svg/src/parseSvgDocument.ts` | SVG XML string → `SvgDocument` |
| `packages/km-svg/src/parseSvgPath.ts` | Path `d` string → `SvgPathCommand[]` |
| `packages/km-svg/src/serializeSvgPath.ts` | `SvgPathCommand[]` → path `d` string |
| `packages/km-svg/tests/parseSvgDocument.test.ts` | Tests |
| `packages/km-svg/tests/parseSvgPath.test.ts` | Tests |

## Step-by-Step Instructions

### `parseSvgDocument`
1. Create `packages/km-svg/src/parseSvgDocument.ts`.
2. Function: `parseSvgDocument(svgString: string): Result<SvgDocument>`.
3. Use the browser-compatible `DOMParser` API — but since this package has no
   DOM dependency, use a **pure XML parser library** instead.
   Install `fast-xml-parser` as a dependency:
   ```bash
   pnpm --filter @komeilm76/km-svg add fast-xml-parser
   ```
4. Parse the SVG XML string into a JSON representation.
5. Walk the parsed tree and convert each node into the correct `SvgElement`
   subtype based on the tag name (`rect`, `circle`, `path`, etc.).
6. For each element:
   - Parse attributes like `fill`, `stroke` into `SvgColor` using a
     helper `parseColor(value: string): SvgColor`.
   - Parse `transform` attribute into `SvgTransform` using a helper
     `parseTransform(value: string): SvgTransform`.
   - Parse `style` attribute as a raw string (do not parse CSS).
   - Unsupported elements (`defs`, `use`, `symbol`, `image`) are skipped silently.
7. Parse the `viewBox` attribute into `SvgViewBox` if present.
8. Parse `width` and `height` attributes into `SvgLength` if present.
9. Return `{ success: true, data: SvgDocument }` or
   `{ success: false, error: { code: "invalid-xml", ... } }`.

### `parseSvgPath`
10. Create `packages/km-svg/src/parseSvgPath.ts`.
11. Function: `parseSvgPath(d: string): Result<SvgPathCommand[]>`.
12. Implement a hand-written tokenizer for SVG path data:
    - Split on command letters (M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z).
    - Parse the numeric arguments following each command letter.
    - Return `{ success: true, data: SvgPathCommand[] }` or an error.
13. Handle both absolute and relative command variants.

### `serializeSvgPath`
14. Create `packages/km-svg/src/serializeSvgPath.ts`.
15. Function: `serializeSvgPath(commands: SvgPathCommand[]): string`.
    This function cannot fail — it returns a plain string.
16. For each command, format as `"CMD arg1,arg2,..."` and join with `" "`.
17. Verify round-trip: `parseSvgPath(serializeSvgPath(commands))` returns the
    original commands (within floating-point tolerance).

### Tests
18. Write `tests/parseSvgDocument.test.ts`:
    - Parse a simple `<svg>` with a `<rect>`.
    - Parse a `<svg>` with nested `<g>` containing elements.
    - Parse a `<svg>` with `viewBox` and `width`/`height`.
    - Unsupported `<image>` element is ignored (not an error).
    - Invalid XML returns `{ success: false, error.code: "invalid-xml" }`.
19. Write `tests/parseSvgPath.test.ts`:
    - Parse a simple `"M 10 10 L 20 20 Z"`.
    - Parse a path with curves (`C` command).
    - Parse a path with arc (`A` command).
    - Round-trip: `serializeSvgPath(parseSvgPath(d).data!)` produces equivalent path.
    - Invalid path string returns an error.

## Acceptance Criteria

- [ ] `parseSvgDocument` returns `SvgDocument` for valid SVG
- [ ] `parseSvgDocument` returns `"invalid-xml"` error for malformed XML
- [ ] Unsupported elements are silently skipped (not errors)
- [ ] `parseSvgPath` parses all absolute and relative command types
- [ ] `serializeSvgPath` round-trips correctly with `parseSvgPath`
- [ ] No DOM globals (`document`, `window`, `DOMParser`) used
- [ ] All tests pass
- [ ] Build succeeds, Zod-leak check passes

## Notes
- The no-DOM constraint is strict. Using `new DOMParser()` would fail in Node.js
  unless explicitly polyfilled. `fast-xml-parser` is a pure-JS alternative that
  works everywhere.
- `parseSvgPath` is a non-trivial tokenizer. The SVG path grammar allows numbers
  to be separated by spaces or commas, or even by the sign of the next number
  (e.g., `"M10-5"` is valid). Use a character-by-character state machine or a
  regex-split approach that handles all edge cases.
- `serializeSvgPath` should round-trip exactly with `parseSvgPath` — write a
  property-style test that verifies this for a variety of generated paths.
