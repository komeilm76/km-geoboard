# A. Blockers (the project is not operational until these are done)

### A1. `exports` package placeholder identity
- Rename folder `packages/exports` → `packages/km-exports`.
- In its `package.json`: `"name": "km-exports"`, dependencies `@yourscope/shared|artboard|geojson|svg` → `km-shared|km-artboard|km-geojson|km-svg` (`workspace:*`).
- Replace `@yourscope/…` references in source comments and `index.ts` examples.
- **This alone unblocks `pnpm install` for the whole workspace.**

### A2. Eliminate the Zod leak in `km-shared`
- Give every `zodUtils.ts` factory an **explicit structural return type** (or a locally
  defined opaque type), exactly as `DT-Zod.md` §IDE-Safe Rules and `zod_hang.md` §4–6
  prescribe. Inferred returns are what pull `z.ZodString` into `dist/index.d.ts`.
- Acceptance: `grep -rn "import.*zod" dist/` is empty for **every** package, and the
  grep must not be line-anchored (`^import` misses mid-line imports in bundled output).
- Because every package depends on `km-shared`, fix this **before** rebuilding anything else.

### A3. Build output ≠ exports map
- `km-shared` (and any package with the same pattern): make tsup actually emit to the
  paths the `exports` map declares (`dist/esm/`, `dist/cjs/`, `dist/types/`), or simplify
  the `exports` map to the flat paths tsup emits. Pick one shape and apply it to all 8 packages.
- Acceptance: after `pnpm -r build`, `node -e "require('km-shared')"` and an ESM import
  both resolve from a sibling package.

### A4. One toolchain, not two
- Decide: **pnpm-only** (recommended — it is what the root already uses and what CI will
  use) or Bun-first. Then remove `bun run` from all package scripts
  (`"build:tsup": "npm run build:types && tsup"` or simply `tsc && tsup` via pnpm).
- Acceptance: `pnpm -r build && pnpm -r test && pnpm -r check-zod` succeeds on a machine
  with only Node + pnpm installed.

### A5. Remove committed build artifacts from `src/`
- Delete the 43 `.js` / `.d.ts` / `.map` files inside `km-geojson/src`, `km-shared/src`,
  `km-svg/src`, and `km-svg/tests` (keep the `.ts` sources).
- Add `src/**/*.js`, `src/**/*.d.ts`, `src/**/*.map` to `.gitignore` or, better, fix the
  `tsc` invocations so they can never emit in-place again (`noEmit` for lint,
  `outDir` for build).
- This directly fixes the two failing `km-geojson` suites.
