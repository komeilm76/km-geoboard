# Checklist — Page 07-04 Plugin Package Finalization

## Package Sign-Off

- [ ] `help.md` has Overview section
- [ ] `help.md` has Installation section
- [ ] `help.md` has Quick Start with a two-plugin end-to-end example
- [ ] `help.md` has Functions section (all 4 functions documented)
- [ ] `help.md` has Registry Methods section (all 6 methods documented)
- [ ] `help.md` has Writing a Plugin tutorial (step-by-step)
- [ ] `help.md` has Error Codes section with all 6 codes
- [ ] `help.md` has Design Principles section with all 6 principles
- [ ] `CHANGELOG.md` updated with all additions from pages 07-01 to 07-04
- [ ] `pnpm --filter @yourscope/plugins lint` — zero TypeScript errors
- [ ] `pnpm --filter @yourscope/plugins test` — all tests green
- [ ] `pnpm --filter @yourscope/plugins build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/plugins/dist/` — returns empty

## Full Monorepo Sign-Off

- [ ] `pnpm -r lint` — zero errors across all 8 packages
- [ ] `pnpm -r test` — all tests green across all 8 packages
- [ ] `pnpm -r build` — all 8 packages build successfully
- [ ] `pnpm -r check-zod` — zero Zod imports in dist/ for every package

## Per-Package Final Verification

- [ ] `@yourscope/shared` — `grep` clean, tests pass
- [ ] `@yourscope/artboard` — `grep` clean, tests pass
- [ ] `@yourscope/geojson` — `grep` clean, tests pass
- [ ] `@yourscope/svg` — `grep` clean, tests pass
- [ ] `@yourscope/map` — `grep` clean, tests pass
- [ ] `@yourscope/imports` — `grep` clean, tests pass
- [ ] `@yourscope/exports` — `grep` clean, tests pass
- [ ] `@yourscope/plugins` — `grep` clean, tests pass

## Pre-Publish Checklist (per package)

- [ ] `package.json` version matches intended initial release
- [ ] `CHANGELOG.md` has entry for the published version
- [ ] `help.md` accurately describes what was actually built
- [ ] `dist/` rebuilt fresh with `pnpm build` immediately before publish
- [ ] Publish order respected: `shared` → `artboard`/`geojson` → `svg`/`map` → `imports`/`exports`/`plugins`
