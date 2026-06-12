# Issues

## Open

| ID | Issue | Status | Notes |
|---|---|---|---|
| I-001 | `release.yml` cannot publish — `NPM_TOKEN` repo secret not set | 🧊 | Komeil must add the secret in GitHub repo settings |

## Closed

| ID | Issue | Status | Date | Resolution |
|---|---|---|---|---|
| I-000 | Zod types leaking into published `.d.ts` → IDE hang | ✅ | 2026-06-11 | `$SchemaOf<T>` structural types in km-shared; guarded by `scripts/check-zod.mjs` |
