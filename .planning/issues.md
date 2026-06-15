# Issues

## Open

| ID | Issue | Status | Notes |
|---|---|---|---|
| I-004 | Stale changesets on `main`: `readme-docs-expansion.md` + `wkt-importer-plugin.md` were NOT deleted after the 0.2.1 release shipped (their content is already in CHANGELOGs/npm via 31dd255 + 4e2c5c0). The changesets bot therefore opened a DUPLICATE release PR #3 (`changeset-release/main`, "version packages") proposing double-bumps for already-published content: km-geoboard 0.2.2, km-imports 0.3.0 (minor again), rest +patch. Also the mount has an uncommitted, now-wrong revert downgrading package.json to 0.2.0/0.1.1 + deleting the 0.2.1 CHANGELOG entries. | 🔄 | Fix in T-024: close PR #3 WITHOUT merging; `git rm` the 2 stale changesets on main; DISCARD the local version-revert (npm is already at 0.2.1) |

## Closed

| I-002 | `importWkt` regex bug: `/[+-.\d]/` range included `,`, breaking all non-POINT types without Z/M modifier | ✅ | 2026-06-13 | Escaped hyphen → `/[+\-.\.\d]/` in `readPosition` else-branch; caught by new T-021 tests |

| ID | Issue | Status | Date | Resolution |
|---|---|---|---|---|
| I-002 | `importWkt` regex bug: `/[+-.\d]/` range included `,`, breaking all non-POINT types without Z/M modifier | ✅ | 2026-06-13 | Escaped hyphen → `/[+\-.\.\d]/` in `readPosition` else-branch; caught by new T-021 tests |
| I-000 | Zod types leaking into published `.d.ts` → IDE hang | ✅ | 2026-06-11 | `$SchemaOf<T>` structural types in km-shared; guarded by `scripts/check-zod.mjs` |
| I-001 | `release.yml` cannot publish — `NPM_TOKEN` repo secret not set | ✅ | 2026-06-12 | Komeil added the secret; T-009 unblocked |
| I-003 | CI red on every job: `pnpm install --frozen-lockfile` failed `ERR_PNPM_OUTDATED_LOCKFILE` — `apps/playground/package.json` (T-023) committed without regenerating the lockfile | ✅ | 2026-06-15 | Ran `pnpm install --lockfile-only` (added apps/playground importer, +78 lines); verified frozen-lockfile passes ("Lockfile is up to date"); committed e697b67 to main |
