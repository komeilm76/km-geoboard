# Checklist — Page 00-02 Shared Types

- [ ] `packages/km-shared/src/types.ts` exists
- [ ] `Result<T>` exported — success branch has `data: T`
- [ ] `Result<T>` exported — failure branch has `error: ResultError`
- [ ] `ResultError` has `code: string`, `message: string`, `field?: string`
- [ ] `packages/km-shared/src/index.ts` re-exports both types
- [ ] `packages/km-shared/package.json` has correct name and version
- [ ] `packages/km-shared/tsconfig.json` extends root config
- [ ] `packages/km-shared/tsup.config.ts` exists
- [ ] `pnpm --filter @komeilm76/km-shared build` succeeds
- [ ] `dist/` contains `.d.ts` declaration files
- [ ] `grep -rn "^import.*zod" packages/km-shared/dist/` returns empty
- [ ] `help.md` written with Overview, Types, Examples sections
- [ ] `CHANGELOG.md` has `## [0.1.0]` entry
- [ ] `README.md` has install command and quick-start example
