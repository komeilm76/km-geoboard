# Page 00-03 — Zod Utilities

## Summary
Adds Zod v4 and creates the two files that every other package will import
from `@yourscope/shared`: `zodUtils.ts` (reusable schema factory functions)
and `zodStructural.ts` (the two structural types that prevent IDE freezes when
Zod types would otherwise appear in `.d.ts` files).

## Target
`packages/shared/src/zodUtils.ts` exports all standard schema utilities.
`packages/shared/src/zodStructural.ts` exports `$AnyZodObject` and `$AnyZodType`.
Both are re-exported from `packages/shared/src/index.ts`.
The package builds cleanly and `dist/` has zero Zod imports.

## Dependencies
- Page 00-01 (monorepo-setup)
- Page 00-02 (shared-types) — `packages/shared` already exists and builds

## Inputs
- `DT-Zod.md` — full schema utility function specs, structural type definitions,
  naming conventions, `peerDependency` rule.
- `zod_hang.md` — complete explanation of the IDE-freeze problem and all rules.
- `DT-Flexibility.md` — `package.json` peer/dev dependency pattern.

## Outputs

| File | Purpose |
|---|---|
| `packages/shared/src/zodUtils.ts` | Schema factory functions: `finiteNumber`, `uuid`, `pointSchema`, etc. |
| `packages/shared/src/zodStructural.ts` | `$AnyZodObject`, `$AnyZodType` — structural Zod substitutes |
| `packages/shared/src/index.ts` | Updated to re-export all new symbols |
| `packages/shared/package.json` | Updated to add `zod` as `peerDependency` + `devDependency` |
| `packages/shared/tests/zodUtils.test.ts` | Vitest tests for every utility function |

## Step-by-Step Instructions

1. Add Zod to `packages/shared/package.json`:
   ```json
   "peerDependencies": { "zod": ">=4.4.0" },
   "devDependencies": { "zod": "^4.4.0" }
   ```
   Then run `pnpm install` at the root to install it.

2. Create `packages/shared/src/zodUtils.ts`.
   Implement every utility function listed in `DT-Zod.md` §"Standard Schema Utilities":
   - `nonEmptyString()` → `z.string().trim().min(1)`
   - `positiveNumber()` → `z.number().positive()`
   - `nonNegativeNumber()` → `z.number().min(0)`
   - `finiteNumber()` → `z.number().finite()`
   - `uuid()` → `z.string().uuid()`
   - `unixTimestampMs()` → `z.number().int().min(0).safe()`
   - `pointSchema()` → `z.object({ x: finiteNumber(), y: finiteNumber() })`
   - `latLngSchema()` → `z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })`
   - `colorHexSchema()` → regex `/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`
   - `percentSchema()` → `z.number().min(0).max(100)`
   - `opacitySchema()` → `z.number().min(0).max(1)`
   - `boundingBoxSchema()` → 4-tuple with `min <= max` refinement
   - `withDefault<T>(schema, value)` → `schema.default(value)`
   Each function must have a JSDoc comment with `@example`.

3. Create `packages/shared/src/zodStructural.ts`:
   ```ts
   /**
    * Local structural substitute for z.ZodObject<any>.
    * Use as a generic constraint in all exported function signatures.
    * Compatible with Zod v4.4.x (_zod internal field).
    *
    * NEVER import z.ZodObject<any> or z.ZodTypeAny in exported signatures.
    * See zod_hang.md and DT-Zod.md §"IDE-Safe Library Rules".
    */
   export type $AnyZodObject = {
     readonly _zod: { readonly output: Record<string, unknown> };
     shape: Record<string, unknown>;
   };

   /**
    * Local structural substitute for z.ZodTypeAny.
    * Use as a generic constraint in all exported function signatures.
    */
   export type $AnyZodType = {
     readonly _zod: { readonly output: unknown };
   };
   ```

4. Update `packages/shared/src/index.ts` to re-export from both new files:
   ```ts
   export type { Result, ResultError } from "./types";
   export * from "./zodUtils";
   export type { $AnyZodObject, $AnyZodType } from "./zodStructural";
   ```

5. Create `packages/shared/tests/zodUtils.test.ts`.
   Write Vitest tests for every utility:
   - `finiteNumber()` — accepts `0`, `-1.5`, rejects `NaN`, `Infinity`, `-Infinity`.
   - `nonEmptyString()` — accepts `"hello"`, rejects `""`, `"   "`.
   - `uuid()` — accepts a valid UUID v4, rejects `"not-a-uuid"`.
   - `pointSchema()` — accepts `{ x: 0, y: -5 }`, rejects `{ x: NaN, y: 0 }`.
   - `latLngSchema()` — accepts `{ lat: 0, lng: 0 }`, rejects `{ lat: 91, lng: 0 }`.
   - `boundingBoxSchema()` — accepts `[0,0,1,1]`, rejects `[1,0,0,1]` (minX > maxX).
   - `opacitySchema()` — accepts `0`, `1`, `0.5`, rejects `-0.1`, `1.1`.

6. Run `pnpm --filter @yourscope/shared build`.
7. Run `grep -rn "^import.*zod" packages/shared/dist/`. **Must return empty.**
8. Run `pnpm --filter @yourscope/shared test`. All tests must pass.

## Acceptance Criteria

- [ ] All 13 utility functions are implemented and exported
- [ ] `$AnyZodObject` is exported from `zodStructural.ts`
- [ ] `$AnyZodType` is exported from `zodStructural.ts`
- [ ] Both structural types are re-exported from `index.ts`
- [ ] Zod is declared as `peerDependency` and `devDependency` (not `dependency`)
- [ ] Build succeeds with no TypeScript errors
- [ ] `grep -rn "^import.*zod" packages/shared/dist/` returns **empty**
- [ ] All Vitest tests pass
- [ ] Every function has a JSDoc `@example`

## Notes
- The structural types in `zodStructural.ts` must reflect Zod v4's internal field
  name `_zod.output`. If Zod is upgraded to a future major version that renames
  this field, this file must be updated. Leave a comment noting the Zod version.
- `withDefault<T>` is a convenience wrapper — it does not add new semantics,
  just makes the default value explicit and readable at the call site.
- See `zod_hang.md` §"Rules, Conditions, and Limitations" for the full matrix
  of which patterns cause IDE freezes. Read it once before working on any
  package that exports functions accepting schemas.
- Schemas (Zod objects) must NOT be exported from `index.ts` unless explicitly
  required — exporting them risks leaking Zod types into declaration files.
