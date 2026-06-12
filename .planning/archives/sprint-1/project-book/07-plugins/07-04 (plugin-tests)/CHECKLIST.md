# Checklist — Page 07-04 Plugin Package Finalization

## Package Sign-Off

- [x] `help.md` has Overview section
- [x] `help.md` has Installation section
- [x] `help.md` has Quick Start with a two-plugin end-to-end example
- [x] `help.md` has Functions section (all 4 functions documented)
- [x] `help.md` has Registry Methods section (all 6 methods documented)
- [x] `help.md` has Writing a Plugin tutorial (step-by-step)
- [x] `help.md` has Error Codes section with all 6 codes
- [x] `help.md` has Design Principles section with all 6 principles
- [x] `CHANGELOG.md` updated with all additions from pages 07-01 to 07-04
- [x] `pnpm --filter @komeilm76/km-plugins lint` — zero TypeScript errors
- [x] `pnpm --filter @komeilm76/km-plugins test` — all tests green
- [x] `pnpm --filter @komeilm76/km-plugins build` — succeeds
- [x] `grep -rn "^import.*zod" packages/km-plugins/dist/` — returns empty

## Full Monorepo Sign-Off

- [x] `pnpm -r lint` — zero errors across all 8 packages
- [x] `pnpm -r test` — all tests green across all 8 packages
- [x] `pnpm -r build` — all 8 packages build successfully
- [x] `pnpm -r check-zod` — zero Zod imports in dist/ for every package

## Per-Package Final Verification

- [x] `@komeilm76/km-shared` — `grep` clean, tests pass
- [x] `@komeilm76/km-artboard` — `grep` clean, tests pass
- [x] `@komeilm76/km-geojson` — `grep` clean, tests pass
- [x] `@komeilm76/km-svg` — `grep` clean, tests pass
- [x] `@komeilm76/km-map` — `grep` clean, tests pass
- [x] `@komeilm76/km-imports` — `grep` clean, tests pass
- [x] `@komeilm76/km-exports` — `grep` clean, tests pass
- [x] `@komeilm76/km-plugins` — `grep` clean, tests pass

## Pre-Publish Checklist (per package)

- [x] `package.json` version matches intended initial release
- [x] `CHANGELOG.md` has entry for the published version
- [x] `help.md` accurately describes what was actually built
- [x] `dist/` rebuilt fresh with `pnpm build` immediately before publish
- [x] Publish order respected: `shared` → `artboard`/`geojson` → `svg`/`map` → `imports`/`exports`/`plugins`
