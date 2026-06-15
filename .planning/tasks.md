# Tasks

> Pick the first non-✅ item. Update status + date when state changes.

## Open

| ID | Task | Status | Notes |
|---|---|---|---|
| T-015 | Windows `pnpm install` to sync local node_modules | 🧊 | Blocked on Komeil (local machine). CI half done: ci.yml badge on main = passing, verified 2026-06-12 (covers f4f6bb7 + 128def1 + b8074de → T-007 folded in, ✅) |
| T-024 | Clean up stale changesets / abort duplicate release PR #3 (was: "ship docs-patch release") | ⏳ | ⚠️ The docs-patch release ALREADY SHIPPED — npm + CHANGELOGs show 0.2.1 (geoboard), 0.2.0 (imports, WKT minor), 0.1.2/0.1.1 (rest) live via 31dd255/4e2c5c0. The 2 changeset files were never consumed, so changesets bot opened duplicate release PR #3 proposing double-bumps (geoboard 0.2.2, imports 0.3.0). DO NOT MERGE PR #3. Next session: (1) close PR #3, (2) `git rm .changeset/readme-docs-expansion.md .changeset/wkt-importer-plugin.md` on main + push, (3) discard mount's uncommitted version-revert. See I-004 |

## Done

| ID | Task | Status | Date |
|---|---|---|---|
| T-020 | Branch protection on `main` (B-004): `protect-main` ruleset ACTIVE — required status checks (`verify (18/20/22)` + `consumer-smoke`), require PR before merge (0 approvals), block force pushes, restrict deletions. Direct pushes to `main` now go via branch+PR | ✅ | 2026-06-15 |
| T-023 | Playground app under `apps/` (B-011): Vite+React+TS — ArtboardCanvas (SVG click-drag), ImportPanel (importAuto + file drop), GeoJsonViewer, ExportPanel (GeoJSON/SVG/meta); workspace:* dep on km-geoboard. (Lockfile regen + CI fix → I-003) | ✅ | 2026-06-15 |
| T-022 | Docs site bootstrap (B-010): TypeDoc API (markdown, all 9 packages) + Astro shell under `apps/docs` + 5 example pages w/ live examples (artboard quick start, SVG→GeoJSON, tile math, import/export round-trip, plugin registry); GitHub Pages deploy workflow. v0.5 metric met | ✅ | 2026-06-14 |
| T-021 | First format importer shipped AS a plugin: WKT (F-001 + F-005 start) | ✅ | 2026-06-13 |
| T-018 | Zod canary: `scripts/canary-zod.mjs` + non-blocking `canary-zod` ci.yml job (zod@latest + typescript@latest in temp fixture; PASS in sandbox). R-1 mitigation done | ✅ | 2026-06-12 |
| T-019 | `scripts/check-standards.mjs` (naming, exports map, files, engines, publishConfig, repository, scripts, zod placement conditional on usage, workspace protocol, tsconfig shape, required files, coverage thresholds) + ci.yml gate + root scripts. Found+fixed real drift: km-plugins README wrongly told users to install zod. R-2 mitigation done | ✅ | 2026-06-12 |
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
