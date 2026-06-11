# Checklist — Page 00-02 Shared Types

- [ ] `packages/shared/src/types.ts` exists
- [ ] `Result<T>` exported — success branch has `data: T`
- [ ] `Result<T>` exported — failure branch has `error: ResultError`
- [ ] `ResultError` has `code: string`, `message: string`, `field?: string`
- [ ] `packages/shared/src/index.ts` re-exports both types
- [ ] `packages/shared/package.json` has correct name and version
- [ ] `packages/shared/tsconfig.json` extends root config
- [ ] `packages/shared/tsup.config.ts` exists
- [ ] `pnpm --filter @yourscope/shared build` succeeds
- [ ] `dist/` contains `.d.ts` declaration files
- [ ] `grep -rn "^import.*zod" packages/shared/dist/` returns empty
- [ ] `help.md` written with Overview, Types, Examples sections
- [ ] `CHANGELOG.md` has `## [0.1.0]` entry
- [ ] `README.md` has install command and quick-start example
