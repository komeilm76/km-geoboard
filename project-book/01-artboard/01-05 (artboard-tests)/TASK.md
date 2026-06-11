# Page 01-05 — Artboard Package Finalization

## Summary
Finalizes the artboard package: completes `help.md` with the full API
reference, adds the Zod schema completeness check (ensuring every type has a
matching schema), adds a schema for `Artboard` itself, and runs the full
test suite and CI checks to confirm the package is ready.

## Target
`packages/artboard/help.md` is complete with all function and type docs.
`packages/artboard/src/schemas.ts` has an `ArtboardSchema` that matches
the `Artboard` type exactly. All tests pass. CI checks pass.

## Dependencies
- Page 01-04 (snap-to-grid) — all artboard functions must exist

## Inputs
- `DT-Artboard.md` — full spec for all types and functions.
- `DT-Zod.md` — schema completeness requirement, type-check pattern.
- `DT-Logics.md` — `help.md` required sections, JSDoc requirements.

## Outputs

| File | Purpose |
|---|---|
| `packages/artboard/src/schemas.ts` | Updated with `ArtboardSchema` and type-check assertion |
| `packages/artboard/help.md` | Complete API documentation |

## Step-by-Step Instructions

1. Open `packages/artboard/src/schemas.ts` and add `ArtboardSchema`:
   ```ts
   import { z } from "zod";
   import { finiteNumber, uuid, nonEmptyString, unixTimestampMs } from "@yourscope/shared";

   const PointSchema = z.object({
     x: finiteNumber(),
     y: finiteNumber(),
   });

   const SizeSchema = z.object({
     width:  finiteNumber(),
     height: finiteNumber(),
   });

   export const ArtboardSchema = z.object({
     id:         uuid(),
     name:       nonEmptyString(),
     origin:     PointSchema,
     size:       SizeSchema,
     startPoint: PointSchema,
     endPoint:   PointSchema,
     createdAt:  unixTimestampMs(),
   });
   ```

2. Add the type-divergence guard below the schema:
   ```ts
   import type { Artboard } from "./types";

   type _ArtboardCheck =
     z.infer<typeof ArtboardSchema> extends Artboard
       ? Artboard extends z.infer<typeof ArtboardSchema>
         ? true
         : never
       : never;
   // If this line produces a TypeScript error, the schema and type have diverged.
   const _assertArtboard: _ArtboardCheck = true;
   void _assertArtboard;
   ```

3. Export `ArtboardSchema` from `packages/artboard/src/index.ts`.
   (Schemas are exported when consumers may need to validate artboard data.)

4. Write `packages/artboard/help.md` with all required sections:

   **Overview** — what the artboard package does, when to use it.

   **Installation** — `npm install @yourscope/artboard`.

   **Functions** — one subsection per function:
   - `createArtboard` — input table, output description, example.
   - `resizeArtboard` — input table, output, example.
   - `moveArtboard` — input table, output, example.
   - `artboardToRect` — input, output, example.
   - `artboardFromRect` — input, output, reverse-of note.
   - `artboardContainsPoint` — input, output, example.
   - `artboardsOverlap` — input, output, example.
   - `snapArtboardToGrid` — input table with mode column, output, 3 examples.

   **Types** — field tables for `Artboard`, `Point`, `Size`.

   **Errors** — table with `reason` values `"too-small"` and `"invalid-input"`.

5. Update `packages/artboard/CHANGELOG.md` with all additions under `## [0.1.0]`.

6. Run the full suite:
   ```bash
   pnpm --filter @yourscope/artboard lint
   pnpm --filter @yourscope/artboard test
   pnpm --filter @yourscope/artboard build
   grep -rn "^import.*zod" packages/artboard/dist/
   ```
   All must pass / return empty.

## Acceptance Criteria

- [ ] `ArtboardSchema` exists in `schemas.ts` and matches the `Artboard` type
- [ ] Type-divergence guard compiles without error
- [ ] `ArtboardSchema` is exported from `index.ts`
- [ ] `help.md` has all required sections (Overview, Installation, Functions, Types, Errors)
- [ ] Every function has an input table and a code example in `help.md`
- [ ] `CHANGELOG.md` covers all items added in pages 01-01 through 01-05
- [ ] `pnpm --filter @yourscope/artboard lint` passes (zero TypeScript errors)
- [ ] `pnpm --filter @yourscope/artboard test` passes (all tests green)
- [ ] `pnpm --filter @yourscope/artboard build` succeeds
- [ ] `grep -rn "^import.*zod" packages/artboard/dist/` returns empty

## Notes
- The type-divergence guard is a compile-time assertion, not a runtime check.
  It uses conditional types to verify the Zod-inferred type is structurally
  identical to the hand-written type. If the schema and type ever diverge (e.g.
  a field is added to `Artboard` but not to `ArtboardSchema`), TypeScript will
  error on the `= true` assignment.
- `ArtboardSchema` is exported because consumers may store artboards as JSON
  and need to re-validate them on load. Exporting the schema is safe here because
  the schema is used as a value (not in a function signature), so it does not
  appear as a type in the declaration files.
- After this page, the artboard chapter is complete. Confirm all 5 pages are
  checked off before beginning Chapter 02.
