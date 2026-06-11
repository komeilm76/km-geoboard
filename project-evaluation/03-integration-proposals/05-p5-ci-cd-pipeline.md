# P5. CI/CD pipeline (GitHub Actions)

```
on: push/PR
  job verify:  pnpm install → pnpm -r lint → pnpm -r test → pnpm -r build
               → pnpm -r check-zod → node scripts/check-conformance.mjs
  matrix: node 18 / 20 / 22
  job release (manual/tag): changesets publish to npm
```

Plus a second workflow that consumes the built `@komeilm76/km-shared` in a scratch TypeScript project
and runs `tsc --noEmit` with a time budget — an automated regression test for the IDE-hang
problem itself (this is the check `zod_hang.md` §8 describes, automated).
