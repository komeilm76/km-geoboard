# Sprint-2 report — IN PROGRESS (opened 2026-06-12)

Scope: Phase C — operationalize (publish-readiness). Exit: packages publishable to npm with proof of usability.

## Archived so far

| Item | State at archive | Merged where |
|---|---|---|
| `audit-2026-06-12-publish-readiness.md` | Processed | T-012, T-013, T-014 added to `tasks.md`; T-008/T-010 statuses updated |

## Work completed 2026-06-12 (publish-readiness)

- **T-013/T-008** — coverage thresholds (80 branch / 85 funcs·lines·stmts) now in all 9 packages; `@vitest/coverage-v8` added as devDep (root + 9 packages); `pnpm test:coverage` at root; ci.yml Test step now runs coverage. Three new test files raised km-geojson (funcs 78→100%), km-svg (lines 65→97%), km-exports (lines 81→97%). All 9 packages verified above bars in sandbox.
- **T-012** — `scripts/smoke-consumer.mjs` + `consumer-smoke` CI job. Verified end-to-end in sandbox: 9 tarballs packed, installed in fresh fixture, ESM OK, CJS OK, consumer `tsc --noEmit` 2264 ms (< 5 s metric), no Zod in packed declarations (same comment-skipping rule as check-zod).
- **T-014** — stale root `CHANGES.md` deleted.
- **Pending on Komeil (T-015):** Windows `pnpm install` to refresh the lockfile (CI is frozen-lockfile), one local run of coverage + smoke, commit/push, confirm Actions green. Then NPM_TOKEN → publish (T-009).
