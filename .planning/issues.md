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
| I-003 | CI red on every job: `pnpm install --frozen-lockfile` failed `ERR_PNPM_OUTDATED_LOCKFILE` — `apps/playground/package.json` (T-023) committed without regenerating the lockfile | ✅ | 2026-06-15 | Ran `pnpm install --lockfile-only` (added apps/playground importer, +78 lines); verified frozen-lockfile passes ("Lockfile is up to date"); committed e697b67 to main |
