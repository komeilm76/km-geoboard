# Checklist — Page 06-07 Exports Package Finalization

- [ ] `help.md` has Overview section
- [ ] `help.md` has Installation section
- [ ] `help.md` has Quick Start section
- [ ] `help.md` has Functions section — all 6 functions documented
- [ ] Each function has an options table with defaults and a code example
- [ ] `help.md` has Round-Trip Pairs table
- [ ] `help.md` has Filter Application Order as a numbered 5-step list
- [ ] `help.md` has Error Codes section with all 5 codes
- [ ] `help.md` has Raster Export Notes section with consumer canvas example
- [ ] `CHANGELOG.md` updated with all additions from pages 06-01 to 06-07
- [ ] All 6 functions exported from `packages/exports/src/index.ts`
- [ ] All types from `types.ts` exported from `index.ts`
- [ ] `pnpm --filter @yourscope/exports lint` — zero TypeScript errors
- [ ] `pnpm --filter @yourscope/exports test` — all tests green
- [ ] `pnpm --filter @yourscope/exports build` — succeeds
- [ ] `grep -rn "^import.*zod" packages/exports/dist/` — returns empty
