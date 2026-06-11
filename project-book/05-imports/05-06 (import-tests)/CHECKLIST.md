# Checklist — Page 05-06 Imports Package Finalization

- [ ] `help.md` has Overview section
- [ ] `help.md` has Installation section
- [ ] `help.md` has Quick Start section with `importAuto` example
- [ ] `help.md` has Functions section — all 6 functions documented
- [ ] Each function has an input table and a code example
- [ ] `help.md` has Warnings vs Errors table
- [ ] `help.md` has Normalization Rules section
- [ ] `help.md` has Error Codes section with all 7 codes
- [ ] `CHANGELOG.md` updated with all additions from pages 05-01 to 05-06
- [ ] All 6 functions exported from `packages/km-imports/src/index.ts`
- [ ] All 6 types exported from `packages/km-imports/src/index.ts`
- [ ] `pnpm --filter @komeilm76/km-imports lint` — zero TypeScript errors
- [ ] `pnpm --filter @komeilm76/km-imports test` — all tests green
- [ ] `pnpm --filter @komeilm76/km-imports build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/km-imports/dist/` — returns empty
