# Page 01-02 — Create Artboard Function

## Summary
Implements `createArtboard` — the core function that takes two canvas points
and produces a normalized `Artboard` object. Also creates `schemas.ts` with the
Zod input schema, which validates all incoming data before any computation runs.

## Target
`packages/artboard/src/createArtboard.ts` exports `createArtboard`.
`packages/artboard/src/schemas.ts` exports `CreateArtboardInputSchema`.
All tests pass. No Zod types appear in `dist/` declaration files.

## Dependencies
- Page 00-03 (zod-utils) — `finiteNumber()`, `uuid()`, `nonEmptyString()`, etc.
- Page 01-01 (artboard-types) — `Artboard`, `CreateArtboardInput`, `CreateArtboardResult`

## Inputs
- `DT-Artboard.md` — `createArtboard` function spec, normalization algorithm,
  all four drag directions, error cases.
- `DT-Zod.md` — `safeParse` pattern, schema naming convention, structural type rules.
- `DT-Inputs-and-Outputs.md` — `Result<T>` vs domain-specific result union,
  single-object input rule.

## Outputs

| File | Purpose |
|---|---|
| `packages/artboard/src/schemas.ts` | `CreateArtboardInputSchema` (Zod v4) |
| `packages/artboard/src/createArtboard.ts` | Function implementation |
| `packages/artboard/tests/createArtboard.test.ts` | Vitest tests |

## Step-by-Step Instructions

1. Create `packages/artboard/src/schemas.ts`.
   Import `z` from `'zod'` and the utility functions from `@yourscope/shared`.
   Define `CreateArtboardInputSchema`:
   ```ts
   import { z } from "zod";
   import { finiteNumber, nonEmptyString, uuid } from "@yourscope/shared";

   export const CreateArtboardInputSchema = z.object({
     startPoint: z.object({ x: finiteNumber(), y: finiteNumber() }),
     endPoint:   z.object({ x: finiteNumber(), y: finiteNumber() }),
     name:       nonEmptyString().optional().default("Artboard"),
     id:         uuid().optional(),
     minSize:    finiteNumber().positive().optional().default(1),
   });
   ```

2. Create `packages/artboard/src/createArtboard.ts`.
3. Import `CreateArtboardInput`, `CreateArtboardResult`, `Artboard` from `./types`.
4. Import `CreateArtboardInputSchema` from `./schemas`.
   **Do not import Zod types in the function signature.**
5. Implement `createArtboard(input: CreateArtboardInput): CreateArtboardResult`:
   a. Run `CreateArtboardInputSchema.safeParse(input)`.
   b. If `!parsed.success`, return `{ success: false, reason: "invalid-input" }`.
   c. Destructure `startPoint`, `endPoint`, `name`, `id`, `minSize` from `parsed.data`.
   d. Compute `origin`:
      ```ts
      const origin = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
      };
      ```
   e. Compute `size`:
      ```ts
      const size = {
        width:  Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
      };
      ```
   f. If `size.width < minSize || size.height < minSize`,
      return `{ success: false, reason: "too-small" }`.
   g. Build and return the `Artboard`:
      ```ts
      return {
        success: true,
        artboard: {
          id: id ?? crypto.randomUUID(),
          name,
          origin,
          size,
          startPoint,
          endPoint,
          createdAt: Date.now(),
        },
      };
      ```
6. Add full JSDoc with `@param`, `@returns`, and two `@example` blocks
   (one normal drag, one reverse drag).
7. Export `createArtboard` from `packages/artboard/src/index.ts`.

8. Create `packages/artboard/tests/createArtboard.test.ts`.
   Write tests covering:
   - Normal drag (top-left → bottom-right): verify `origin` and `size`.
   - Reverse drag (bottom-right → top-left): verify `origin` is normalized.
   - Drag mirrored on X only.
   - Drag mirrored on Y only.
   - `name` defaults to `"Artboard"` when omitted.
   - Custom `name` is preserved.
   - Custom `id` is preserved.
   - `id` is a valid UUID when omitted.
   - Returns `"too-small"` when `width < minSize`.
   - Returns `"too-small"` when `height < minSize`.
   - Returns `"too-small"` for a zero-size artboard.
   - Returns `"invalid-input"` for `NaN` coordinates.
   - Returns `"invalid-input"` for `Infinity` coordinates.
   - `minSize` defaults to `1`.
   - Custom `minSize` is respected.

9. Run `pnpm --filter @yourscope/artboard test`.
10. Run `pnpm --filter @yourscope/artboard build`.
11. Run `grep -rn "^import.*zod" packages/artboard/dist/`. Must be empty.

## Acceptance Criteria

- [ ] `createArtboard` returns correct `origin` for all 4 drag directions
- [ ] `createArtboard` returns `"too-small"` when width or height < minSize
- [ ] `createArtboard` returns `"invalid-input"` for non-finite coordinates
- [ ] Default `name` is `"Artboard"`
- [ ] Default `minSize` is `1`
- [ ] Generated `id` is a valid UUID v4
- [ ] `createdAt` is a Unix timestamp in milliseconds
- [ ] All test cases pass
- [ ] JSDoc present with `@param`, `@returns`, `@example`
- [ ] No `any` in signatures
- [ ] `grep -rn "^import.*zod" packages/artboard/dist/` returns empty

## Notes
- `crypto.randomUUID()` is called inside the function body, not in the signature.
  This is correct — runtime calls never appear in `.d.ts` files.
- The `id ?? crypto.randomUUID()` pattern allows callers to pass a fixed ID
  for deterministic tests. Use this pattern in test files.
- `Date.now()` in the function body also never leaks into `.d.ts`. It is still
  a side effect in the strict sense, so tests that need a deterministic timestamp
  can pass a `createdAt` override — but the spec does not require this.
- Zod is used in the function body only. The signature uses plain TypeScript
  types from `./types`. This is the correct pattern per `DT-Zod.md`.
