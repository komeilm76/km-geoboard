# Checklist — Page 05-01 Import Types

- [x] `packages/km-imports/src/types.ts` created — no Zod imports
- [x] `ImportError` exported with `code`, `message`, optional `position`
- [x] `ImportWarning` exported with `code`, `message`, optional `context`
- [x] `ImportErrorCode` exported with all 7 error codes
- [x] `ImportResult<T>` exported — both branches include `warnings`
- [x] `DetectedFormat` exported with 5 variants including `"unknown"`
- [x] `AutoImportResult` exported with all 5 discriminated format branches
- [x] All types exported from `index.ts`
- [x] `packages/km-imports/package.json` depends on `@komeilm76/km-shared`, `@komeilm76/km-geojson`, `@komeilm76/km-svg`, `@komeilm76/km-artboard`
- [x] `zod` as peerDependency and devDependency
- [x] `pnpm --filter @komeilm76/km-imports build` succeeds
- [x] `grep -rn "^import.*zod" packages/km-imports/dist/` returns empty
- [x] `help.md` stub created
- [x] `CHANGELOG.md` has `## [0.1.0]` entry
