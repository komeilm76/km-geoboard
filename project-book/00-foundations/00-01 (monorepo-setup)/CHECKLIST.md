# Checklist — Page 00-01 Monorepo Setup

- [ ] `package.json` exists at root with `"private": true` and workspace scripts
- [ ] `pnpm-workspace.yaml` declares `packages/*`
- [ ] `tsconfig.base.json` has `"strict": true`
- [ ] `tsconfig.base.json` has `"lib": ["ES2020"]` — no `"DOM"`
- [ ] `tsconfig.base.json` has `"exactOptionalPropertyTypes": true`
- [ ] `tsconfig.base.json` has `"noUncheckedIndexedAccess": true`
- [ ] `vitest.config.ts` exists and is valid
- [ ] `.eslintrc.cjs` uses `@typescript-eslint/recommended`
- [ ] `.prettierrc` exists
- [ ] `.gitignore` ignores `dist/`, `node_modules/`, `coverage/`
- [ ] `packages/` directory exists
- [ ] `pnpm install` runs without errors
- [ ] `pnpm -r build` resolves without errors (nothing to build yet)
