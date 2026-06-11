# 01 — Current State Audit (verified)

Every result below was produced by actually running `pnpm install`, `pnpm -r build`, and
`pnpm -r test` against a copy of this repository on 2026-06-11 (Node 22, pnpm 9).

## Contents

| # | Section |
|---|---|
| 01 | [1. Scope coverage — design vs. implementation](./01-scope-coverage.md) |
| 02 | [2. Workspace health — actual command results](./02-workspace-health.md) |
| 03 | [3. Per-package test results (after the install fix)](./03-per-package-test-results.md) |
| 04 | [4. The most serious single defect: Zod leak in `km-shared`](./04-zod-leak-in-km-shared.md) |
| 05 | [5. Build-output / exports-map mismatch](./05-build-output-exports-map-mismatch.md) |
| 06 | [6. Repository hygiene findings](./06-repository-hygiene.md) |
