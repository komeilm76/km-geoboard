# 6. Repository hygiene findings

| Finding | Evidence |
|---|---|
| Two conflicting standards documents | `PACKAGE_STANDARDS.md` (Bun, `build/` with cjs/esm/js triple, Node ≥14) vs `dt_docs/DT-Flexibility.md` (pnpm, `dist/`, Node ≥18). Packages follow one or the other inconsistently: `exports` + `km-plugins` use the `build/` style; the rest use `dist/` |
| Placeholder names never replaced | `exports` package is `@yourscope/exports`; root `README.md` and `src/index.ts` still say `YOUR-PACKAGE-NAME` |
| Compiled artifacts committed inside `src/`/`tests/` | 43 `.js`/`.d.ts`/`.map` files in `km-geojson/src`, `km-shared/src`, `km-svg/src`, `km-svg/tests` (these directly cause the km-geojson failures) |
| Template leftovers at root | `src/core.ts`, `tests/core.test.ts`, root `tsup.config.ts`, `.release-it.json` belong to the single-package template, not the monorepo |
| Missing files | No `LICENSE` in any package (all whitelist it in `files`); no `README.md` in `km-imports`, `km-svg` |
| No version control / CI | No `.git`, no `.github/`, no CI workflow — the CI checklist in `DT-Logics.md` has nothing to run on |
| Folder naming inconsistency | `packages/exports/` is the only folder without the `km-` prefix |
| `exports` package is an island | It re-declares Artboard/SVG/GeoJSON types locally ("Would come from @yourscope/geojson in the full monorepo") instead of importing siblings |
