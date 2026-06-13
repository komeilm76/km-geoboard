# Issues

## Open

| ID | Issue | Status | Notes |
|---|---|---|---|
| — | (none open) | | |

## Closed

| I-002 | `importWkt` regex bug: `/[+-.\d]/` range included `,`, breaking all non-POINT types without Z/M modifier | ✅ | 2026-06-13 | Escaped hyphen → `/[+\-.\.\d]/` in `readPosition` else-branch; caught by new T-021 tests |

| ID | Issue | Status | Date | Resolution |
|---|---|---|---|---|
| I-002 | `importWkt` regex bug: `/[+-.\d]/` range included `,`, breaking all non-POINT types without Z/M modifier | ✅ | 2026-06-13 | Escaped hyphen → `/[+\-.\.\d]/` in `readPosition` else-branch; caught by new T-021 tests |
| I-000 | Zod types leaking into published `.d.ts` → IDE hang | ✅ | 2026-06-11 | `$SchemaOf<T>` structural types in km-shared; guarded by `scripts/check-zod.mjs` |
| I-001 | `release.yml` cannot publish — `NPM_TOKEN` repo secret not set | ✅ | 2026-06-12 | Komeil added the secret; T-009 unblocked |
