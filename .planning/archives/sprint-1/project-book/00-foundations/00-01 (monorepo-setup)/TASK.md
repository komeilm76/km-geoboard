# Page 00-01 — Monorepo Setup

## Summary
Initializes the pnpm workspace monorepo that all packages live inside.
This is the skeleton every other page builds on — without it nothing compiles,
nothing installs, and nothing can be tested.

## Target
The monorepo root exists with a working `pnpm-workspace.yaml`, a shared
`tsconfig.base.json`, a shared `vitest.config.ts`, and an empty `packages/`
directory ready to receive packages.

## Dependencies
- None. This is the first page.

## Inputs
- `DT-Flexibility.md` — monorepo structure, `package.json` shape, `tsconfig.base.json` content.
- `DT-Logics.md` — CI checklist, linting rules.

## Outputs

| File | Purpose |
|---|---|
| `package.json` | Root workspace manifest with scripts |
| `pnpm-workspace.yaml` | Declares `packages/*` as workspace members |
| `tsconfig.base.json` | Shared TypeScript compiler options (strict, no DOM) |
| `vitest.config.ts` | Shared Vitest configuration |
| `.eslintrc.cjs` | ESLint with `@typescript-eslint/recommended` |
| `.prettierrc` | Prettier default config |
| `.gitignore` | Ignores `dist/`, `node_modules/`, coverage |

## Step-by-Step Instructions

1. Create the monorepo root directory and `cd` into it.
2. Run `pnpm init` to generate a base `package.json`.
3. Edit `package.json`:
   - Set `"private": true`.
   - Add a `"workspaces"` field pointing to `"packages/*"`.
   - Add root scripts: `"build": "pnpm -r build"`, `"test": "pnpm -r test"`,
     `"lint": "pnpm -r lint"`, `"check-zod": "pnpm -r check-zod"`.
4. Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'packages/*'
   ```
5. Create `tsconfig.base.json` exactly as specified in `DT-Flexibility.md` §"Root tsconfig.base.json".
   Critical settings: `"strict": true`, `"lib": ["ES2020"]` (no `"DOM"`),
   `"moduleResolution": "bundler"`, `"exactOptionalPropertyTypes": true`,
   `"noUncheckedIndexedAccess": true`.
6. Create `vitest.config.ts`:
   ```ts
   import { defineConfig } from "vitest/config";
   export default defineConfig({
     test: { globals: false, environment: "node" },
   });
   ```
7. Install dev dependencies at the root:
   ```bash
   pnpm add -D -w typescript vitest eslint @typescript-eslint/eslint-plugin \
     @typescript-eslint/parser prettier tsup
   ```
8. Create `.eslintrc.cjs` extending `@typescript-eslint/recommended`.
9. Create `.prettierrc` with `{}` (Prettier defaults).
10. Create `.gitignore` ignoring `dist/`, `node_modules/`, `coverage/`, `*.tsbuildinfo`.
11. Create the empty `packages/` directory (add a `.gitkeep` if needed).
12. Run `pnpm install` at the root. Confirm zero errors.

## Acceptance Criteria

- [x] `pnpm install` completes without errors
- [x] `pnpm -r build` runs (nothing to build yet, but the script resolves)
- [x] `tsconfig.base.json` has `"strict": true` and no `"DOM"` in `"lib"`
- [x] `pnpm-workspace.yaml` declares `packages/*`
- [x] `.gitignore` excludes `dist/` and `node_modules/`
- [x] Root `package.json` has `"private": true`

## Notes
- Do not add `"DOM"` to `tsconfig.base.json` — this is enforced by design.
  Any accidental use of `document` or `window` will be a compile error.
- See `DT-Flexibility.md` §"Monorepo Structure" for the full directory layout.
- The `check-zod` script (`grep -rn "^import.*zod" dist/`) is added here
  at the root level so it can be run across all packages with `pnpm -r check-zod`.
