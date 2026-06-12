# Checklist — Page 00-01 Monorepo Setup

- [x] `package.json` exists at root with `"private": true` and workspace scripts
- [x] `pnpm-workspace.yaml` declares `packages/*`
- [x] `tsconfig.base.json` has `"strict": true`
- [x] `tsconfig.base.json` has `"lib": ["ES2020"]` — no `"DOM"`
- [x] `tsconfig.base.json` has `"exactOptionalPropertyTypes": true`
- [x] `tsconfig.base.json` has `"noUncheckedIndexedAccess": true`
- [x] `vitest.config.ts` exists and is valid (per-package configs; no root config needed)
- [x] `.eslintrc.cjs` uses `@typescript-eslint/recommended`
- [x] `.prettierrc` exists
- [x] `.gitignore` ignores `dist/`, `node_modules/`, `coverage/`
- [x] `packages/` directory exists
- [x] `pnpm install` runs without errors
- [x] `pnpm -r build` resolves without errors (nothing to build yet)
