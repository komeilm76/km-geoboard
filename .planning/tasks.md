# Tasks

> Pick the first non-✅ item. Update status + date when state changes.

## Open

| ID | Task | Status | Notes |
|---|---|---|---|
| T-007 | Verify Phase B on Windows is fully reflected on `main` (lockfile fresh, CI green on GitHub Actions) | ⏳ | Commit b8074de pushed 2026-06-12; confirm Actions run is green |
| T-015 | Confirm CI green on GitHub Actions for commits f4f6bb7 + 128def1 (coverage + consumer-smoke jobs), then Windows `pnpm install` to sync local node_modules | ⏳ | Lockfile already refreshed + pushed from sandbox; merges with T-007 |

## Done

| ID | Task | Status | Date |
|---|---|---|---|
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
