# Checklist — Page 00-02 Shared Types

- [x] `packages/km-shared/src/types.ts` exists
- [x] `Result<T>` exported — success branch has `data: T`
- [x] `Result<T>` exported — failure branch has `error: ResultError`
- [x] `ResultError` has `code: string`, `message: string`, `field?: string`
- [x] `packages/km-shared/src/index.ts` re-exports both types
- [x] `packages/km-shared/package.json` has correct name and version
- [x] `packages/km-shared/tsconfig.json` extends root config
- [x] `packages/km-shared/tsup.config.ts` exists
- [x] `pnpm --filter @komeilm76/km-shared build` succeeds
- [x] `dist/` contains `.d.ts` declaration files
- [x] `grep -rn "^import.*zod" packages/km-shared/dist/` returns empty
- [x] `help.md` written with Overview, Types, Examples sections
- [x] `CHANGELOG.md` has `## [0.1.0]` entry
- [x] `README.md` has install command and quick-start example
