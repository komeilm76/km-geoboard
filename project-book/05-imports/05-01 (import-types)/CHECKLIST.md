# Checklist — Page 05-01 Import Types

- [ ] `packages/imports/src/types.ts` created — no Zod imports
- [ ] `ImportError` exported with `code`, `message`, optional `position`
- [ ] `ImportWarning` exported with `code`, `message`, optional `context`
- [ ] `ImportErrorCode` exported with all 7 error codes
- [ ] `ImportResult<T>` exported — both branches include `warnings`
- [ ] `DetectedFormat` exported with 5 variants including `"unknown"`
- [ ] `AutoImportResult` exported with all 5 discriminated format branches
- [ ] All types exported from `index.ts`
- [ ] `packages/imports/package.json` depends on `@yourscope/shared`, `@yourscope/geojson`, `@yourscope/svg`, `@yourscope/artboard`
- [ ] `zod` as peerDependency and devDependency
- [ ] `pnpm --filter @yourscope/imports build` succeeds
- [ ] `grep -rn "^import.*zod" packages/imports/dist/` returns empty
- [ ] `help.md` stub created
- [ ] `CHANGELOG.md` has `## [0.1.0]` entry
