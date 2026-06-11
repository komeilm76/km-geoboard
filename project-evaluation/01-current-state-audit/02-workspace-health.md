# 2. Workspace health — actual command results

| Command | Result |
|---|---|
| `pnpm install` | ❌ **FAILS** — `exports/package.json` depends on `@yourscope/shared` etc., which do not exist in the workspace |
| `pnpm install` (after renaming `@yourscope/*` → `km-*`) | ✅ succeeds |
| `pnpm -r build` | ❌ **FAILS** — package `build` scripts call `bun run …`; Bun is not part of the root toolchain |
| `pnpm -r test` | ❌ stops at first failing package |
