# Publish-readiness audit — 2026-06-12

> Written as a standalone file because the sandbox was down (host disk full) and
> editing existing files via app tools corrupts them (hints.md). **Next session:
> merge the "New tasks" below into `tasks.md`, then archive this file to the
> current sprint with a report (rule 10).**

## Verified state (read-only audit)

| Check | Result |
|---|---|
| All 9 packages: README.md | ✅ present, real content |
| All 9 packages: CHANGELOG.md | ✅ present with real 0.1.0 entries |
| All 9 packages: LICENSE | ✅ present (MIT) |
| package.json publish metadata (name/exports/files/repository/keywords/engines/publishConfig) | ✅ spot-checked km-svg — complete |
| Workspace green (build / 549 tests / check-zod / lint) | ✅ last verified 2026-06-12 on Windows |
| Coverage thresholds in vitest configs | ⚠️ only 5/9 — **missing in km-geojson, km-svg, km-map, km-geoboard** |
| Coverage enforced in CI | ❌ ci.yml runs `pnpm -r test` without `--coverage` → thresholds never enforced (violates rule 9) |
| CI green on GitHub Actions (T-007) | ❓ could not verify from sandbox (API gave no data — repo likely private). Check the Actions tab for commit b8074de |
| Pending changesets | 2 (`add-umbrella-package` minor, `de-island-exports-and-plugins`) — consumed at `changeset version`, will bump + extend CHANGELOGs |
| Root `CHANGES.md` | ❌ stale template leftover ("YOUR-PACKAGE-NAME", release-it flow we don't use) — remove or archive |
| Consumer smoke test (prove a stranger can use the published artifacts) | ❌ does not exist — the biggest gap for "usable" |

## New tasks (merge into tasks.md)

| ID | Task | Status | Notes |
|---|---|---|---|
| T-012 | Consumer smoke test: `pnpm pack` all 9 packages → install tarballs in a fresh fixture project outside the workspace → import via ESM **and** CJS → `tsc --noEmit` on the fixture (< 5 s metric) → grep packed `.d.ts` for Zod imports | ⏳ | THE gate for "usable"; run on Windows. Automate as `scripts/smoke-consumer.mjs` so CI can run it (rule 9) |
| T-013 | Coverage: add thresholds to km-geojson, km-svg, km-map, km-geoboard vitest configs; run `pnpm -r test:coverage`, raise tests below bar; add coverage step to ci.yml | ⏳ | Completes T-008 (5/9 already have 80/85 bars) |
| T-014 | Delete stale root `CHANGES.md` (template leftover) | ⏳ | Needs `allow_cowork_file_delete` or Komeil deletes it |

## Pre-publish sequence (the "specific usable state")

1. T-013 coverage green everywhere, CI runs it.
2. T-012 consumer smoke test passes (ESM + CJS + types + no-Zod-leak from actual tarballs).
3. T-007 CI green on GitHub Actions confirmed.
4. T-014 stale file removed; `pnpm changeset version` → review bumps + CHANGELOGs → commit.
5. **Only then:** Komeil adds `NPM_TOKEN` secret → T-009 publish (verify all 9 names per R-5).
