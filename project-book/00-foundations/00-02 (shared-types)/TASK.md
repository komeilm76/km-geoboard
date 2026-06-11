# Page 00-02 — Shared Types

## Summary
Creates the `@yourscope/shared` package — the single source of truth for the
`Result<T>` union, `ResultError`, and any other types used across every other
package. Nothing is implemented here; only types and their structural shapes.

## Target
`packages/shared/src/types.ts` exists and exports `Result<T>` and `ResultError`.
`packages/shared/src/index.ts` re-exports all public types.
The package builds cleanly and produces declaration files.

## Dependencies
- Page 00-01 (monorepo-setup) — workspace must be initialized.

## Inputs
- `DT-Inputs-and-Outputs.md` — `Result<T>` definition, `ResultError` shape,
  output shape rules (IDs as strings, timestamps as numbers, no `undefined` in output).
- `DT-Flexibility.md` — per-package `package.json` shape, `tsup.config.ts` shape.

## Outputs

| File | Purpose |
|---|---|
| `packages/shared/src/types.ts` | `Result<T>`, `ResultError` type definitions |
| `packages/shared/src/index.ts` | Public re-exports |
| `packages/shared/package.json` | Package manifest |
| `packages/shared/tsconfig.json` | Extends root config |
| `packages/shared/tsup.config.ts` | Build config |
| `packages/shared/help.md` | API documentation |
| `packages/shared/CHANGELOG.md` | Version history |
| `packages/shared/README.md` | npm/GitHub display page |

## Step-by-Step Instructions

1. Create the directory `packages/shared/src/`.
2. Create `packages/shared/src/types.ts`:

   ```ts
   /**
    * A discriminated union representing the outcome of a fallible operation.
    * On success, `data` holds the result.
    * On failure, `error` holds a structured error with a machine-readable code.
    */
   export type Result<T> =
     | { success: true;  data: T }
     | { success: false; error: ResultError };

   /**
    * Structured error returned inside a failed `Result`.
    */
   export type ResultError = {
     /** Machine-readable error code — use kebab-case. */
     code: string;
     /** Human-readable description of what went wrong. */
     message: string;
     /** The input field that caused the failure, if applicable. */
     field?: string;
   };
   ```

3. Create `packages/shared/src/index.ts`:
   ```ts
   export type { Result, ResultError } from "./types";
   ```

4. Create `packages/shared/package.json` following the template in
   `DT-Flexibility.md` §"package.json Per Package".
   - `"name": "@yourscope/shared"`
   - `"version": "0.1.0"`
   - No `peerDependencies` (this package has no runtime deps).
   - Add `"check-zod"` script.

5. Create `packages/shared/tsconfig.json` extending `../../tsconfig.base.json`.
6. Create `packages/shared/tsup.config.ts` from the template in `DT-Flexibility.md`.
7. Write `packages/shared/help.md` with sections: Overview, Installation, Types
   (`Result<T>`, `ResultError` with field tables), Examples.
8. Create empty `packages/shared/CHANGELOG.md` with a `## [0.1.0]` heading.
9. Create `packages/shared/README.md` with overview, install, quick example.
10. Run `pnpm --filter @yourscope/shared build`. Confirm `dist/` is generated.
11. Run `grep -rn "^import.*zod" packages/shared/dist/`. Confirm empty output.

## Acceptance Criteria

- [ ] `Result<T>` is exported and matches the spec in `DT-Inputs-and-Outputs.md`
- [ ] `ResultError` has `code`, `message`, and optional `field`
- [ ] `packages/shared` builds without TypeScript errors
- [ ] `dist/` contains `.d.ts` files for both ESM and CJS
- [ ] No Zod imports in `dist/` (trivially true — no Zod in this package)
- [ ] `help.md` contains Overview, Types, and Examples sections
- [ ] `CHANGELOG.md` has a `## [0.1.0]` entry

## Notes
- `Result<T>` uses `data` on success (not `value`, not `result`) — be consistent.
- Output types must never have `undefined` fields — use `null` for absent values
  in output. Input types may use `undefined` for optional fields.
- This package has zero dependencies. Keep it that way.
- The `field` property on `ResultError` is optional because not all errors
  are traceable to a single input field.
