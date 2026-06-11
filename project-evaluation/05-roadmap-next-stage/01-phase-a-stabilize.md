# Phase A — Stabilize (≈ 6–8 h) ← **start here, this is "the next stage"**

Order matters: fix the foundation first, then everything downstream.

1. Rename `exports` → `km-exports`; replace all `@yourscope/*` names (`pnpm install` goes green). — 0.5 h
2. Fix `km-shared` zodUtils return types → rebuild → `check-zod` clean. — 1–2 h
3. Align tsup output with `exports` maps in all 8 packages (one canonical shape). — 1 h
4. Strip `bun run` from package scripts; pnpm-only chain. — 0.5 h
5. Delete the 43 committed artifacts in `src/`/`tests/`; harden tsconfig/gitignore. — 0.5 h
6. Fix `-0` in `snapArtboardToGrid`; re-derive `km-map` test constants with relative tolerances. — 1–2 h
7. Decide standards table (doc 02 §C); update the two standards docs. — 1 h
8. Root cleanup: template leftovers, root README, per-package LICENSE/README. — 1 h

**Exit:** fresh clone → `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod` all green, Node-only.

---

## ✅ Status: COMPLETED 2026-06-11

All 8 items executed and verified on Node 22 / pnpm 9 (no Bun installed):

| Check | Result |
|---|---|
| `pnpm install` | ✅ green (exports → km-exports, all `@yourscope/*` renamed) |
| `pnpm -r build` | ✅ 8/8 packages, flat `dist/` (index.js ESM, index.cjs CJS, index.d.ts) |
| `pnpm -r test` | ✅ 549/549 tests, 8/8 packages |
| `pnpm -r check-zod` | ✅ 8/8 — zero Zod references in any declaration file (`scripts/check-zod.mjs`) |
| `pnpm -r lint` | ✅ `tsc --noEmit` clean everywhere |
| Sibling resolution | ✅ `require('km-shared')` and ESM import both resolve from km-artboard |

Notable implementation decisions:
- `km-shared` factories return explicit `$SchemaOf<T>` structural types (new in
  `zodStructural.ts`, exported); km-artboard/km-svg `schemas.ts` cast back to real
  Zod types internally for chaining (documented cast pattern).
- `check-zod` is now a portable Node script (grep failed on Windows and produced
  false negatives on comments / false positives on runtime bundles).
- Per-package vitest aliases map workspace deps to sibling `src/`, removing
  build-order coupling during development.
- 43 committed artifacts deleted; per-package tsconfig is `noEmit: true` so tsc
  can never emit in-place again.
- `-0` normalized in `snapArtboardToGrid`; km-map test constants re-derived
  (R = 6378137) with relative tolerances.

**Post-Phase-A update (same day):** all packages renamed to the `@komeilm76/km-*`
npm scope (vueuse-style; `km-` is the brand prefix, folders unchanged). Repo now lives
at github.com/komeilm76/km-geoboard with Changesets + CI/release workflows.

**Next stage: Phase B — Integrate** (`02-phase-b-integrate.md`), starting with
de-islanding `km-exports` (replace its locally duplicated sibling types with real
imports from km-artboard/km-geojson/km-svg).
