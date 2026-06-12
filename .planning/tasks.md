# Tasks

> Pick the first non-✅ item. Update status + date when state changes.

## Open

| ID | Task | Status | Notes |
|---|---|---|---|
| T-015 | Windows `pnpm install` to sync local node_modules | 🧊 | Blocked on Komeil (local machine). CI half done: ci.yml badge on main = passing, verified 2026-06-12 (covers f4f6bb7 + 128def1 + b8074de → T-007 folded in, ✅) |
| T-018 | R-1 Zod canary: CI job compiling `$SchemaOf`/structural types against latest zod | ⏳ | Rule 9. New `canary-zod` job in ci.yml (non-blocking, `continue-on-error`): install `zod@latest` in a temp fixture, `tsc --noEmit` km-shared `zodStructural.ts` + one downstream `schemas.ts` against it. Closes R-1 mitigation gap. ~2 h |
| T-019 | R-2 standards conformance script `scripts/check-standards.mjs` + CI wiring | ⏳ | Rule 9. Verify every package against PACKAGE_STANDARDS table: exports map shape, flat dist (index.js/cjs/d.ts), tsconfig `noEmit:true`, zod peerDep `>=4.4 <5`, `files` field, publishConfig.access. Add `pnpm -r check-standards` or root script + ci.yml step. Closes R-2 mitigation gap. ~3 h |
| T-021 | First format importer shipped AS a plugin: WKT (F-001 + F-005 start) | ⏳ | Smallest format; one module + `importAuto` registry entry + plugin wrapper via km-plugins; `ImportResult` warnings for unsupported WKT variants; tests + coverage bars + changeset (minor km-imports). Validates the formats-as-plugins pattern before KML/GPX/TopoJSON. 4–8 h (one chapter) |
| T-022 | Docs site bootstrap (B-010): TypeDoc API + 5 pages with live examples | ⏳ | v0.5 metric: 5 docs pages w/ live examples. TypeDoc → markdown for all 9 packages; Astro or Nextra shell under `apps/docs`; Sandpack (or Stackblitz embed) for the 5 example pages: artboard quick start, SVG→GeoJSON, tile math, import/export round-trip, plugin registry. Deploy GitHub Pages via workflow. 8–12 h |
| T-023 | Playground app under `apps/` (B-011) | ⏳ | After T-022. Vite app: draw artboards, import file (importAuto), view GeoJSON output, export buttons (SVG/GeoJSON/PDF-meta). Consumes published packages — also serves as downstream consumer #1 for G4. 6–10 h |
| T-020 | Branch protection on `main` (B-004) | 🧊 | Manual GitHub settings (Komeil): require ci.yml checks (verify + consumer-smoke) before merge, no force-push. Settings → Branches → Add rule |
| T-024 | Ship pending docs-patch release (changeset `readme-docs-expansion`) | ⏳ | Wait for changesets release PR on GitHub → review bumps (all 9 patch) → merge → release.yml publishes. Expanded READMEs reach npm package pages |

## Done

| ID | Task | Status | Date |
|---|---|---|---|
| T-017 | Expand all 9 package READMEs (API tables, types, examples, error codes, cross-links); examples type-checked against src; changeset `readme-docs-expansion` added | ✅ | 2026-06-12 |
| T-007 | Verify Phase B fully reflected on `main` — CI badge passing on main, verified 2026-06-12 | ✅ | 2026-06-12 |
| T-001 | Phase A — Stabilize (workspace green: build, 549/549 tests, check-zod, lint) | ✅ | 2026-06-11 |
| T-002 | Git init + GitHub repo `komeilm76/km-geoboard`, v0.1.0 tag | ✅ | 2026-06-11 |
| T-003 | Phase B — Integrate (de-island exports/plugins, umbrella `km-geoboard`, 6 integration suites) | ✅ | 2026-06-12 |
| T-004 | Phase B verification green (build/test/check-zod/lint) | ✅ | 2026-06-12 |
| T-005 | CI + release workflows in `.github/workflows/` | ✅ | 2026-06-12 |
| T-006 | Repo restructure: move dt_docs, project-book, project-evaluation, PACKAGE_STANDARDS.md, zod_hang.md into `.planning/`; create tracking system | ✅ | 2026-06-12 |
| T-011 | Sprint-1 close: archive project-book, dt_docs, project-evaluation → `archives/sprint-1/` (+ reports); create `assigned_sources/` inbox flow; merge risk register, tiers 2–3, non-goals, metrics into tracking files | ✅ | 2026-06-12 |
| T-008 | Coverage thresholds in all 9 vitest configs (80 branches / 85 funcs·lines·stmts) | ✅ | 2026-06-12, via T-013 |
| T-012 | Consumer smoke test `scripts/smoke-consumer.mjs` + CI job — verified in sandbox: 9 tarballs, ESM+CJS OK, tsc 2.26 s, no Zod in `.d.ts` | ✅ | 2026-06-12 |
| T-013 | Coverage: thresholds added to km-geojson/svg/map/geoboard, `@vitest/coverage-v8` devDep everywhere, ci.yml runs `test:coverage`; 3 new test files (105+ new assertions), all 9 packages above bars | ✅ | 2026-06-12 |
| T-014 | Stale root `CHANGES.md` removed | ✅ | 2026-06-12 |
| T-009 | First npm publish via Actions: PR #1 merged → release.yml published all 9 packages (geoboard 0.2.0; artboard/exports/imports/plugins 0.1.1; rest 0.1.0); verified live install + run from registry | ✅ | 2026-06-12 |
| T-016 | Node 18 fix: `createArtboard` crashed (`crypto` global only Node ≥19); `globalThis.crypto` + RFC 4122 fallback, 4 tests; found by CI matrix | ✅ | 2026-06-12 |
| T-010 | CHANGELOG entries — changesets consumed at release; CHANGELOGs updated by release PR | ✅ | 2026-06-12 |
