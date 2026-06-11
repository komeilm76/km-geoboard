# Checklist — Page 05-01 Import Types

- [ ] `packages/km-imports/src/types.ts` created — no Zod imports
- [ ] `ImportError` exported with `code`, `message`, optional `position`
- [ ] `ImportWarning` exported with `code`, `message`, optional `context`
- [ ] `ImportErrorCode` exported with all 7 error codes
- [ ] `ImportResult<T>` exported — both branches include `warnings`
- [ ] `DetectedFormat` exported with 5 variants including `"unknown"`
- [ ] `AutoImportResult` exported with all 5 discriminated format branches
- [ ] All types exported from `index.ts`
- [ ] `packages/km-imports/package.json` depends on `@komeilm76/km-shared`, `@komeilm76/km-geojson`, `@komeilm76/km-svg`, `@komeilm76/km-artboard`
- [ ] `zod` as peerDependency and devDependency
- [ ] `pnpm --filter @komeilm76/km-imports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
- [ ] `help.md` stub created
- [ ] `CHANGELOG.md` has `## [0.1.0]` entry
