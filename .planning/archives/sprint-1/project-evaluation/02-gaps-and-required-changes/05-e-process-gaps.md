# E. Process gaps (nothing enforces the rules yet)

- No CI. The complete checklist already exists in `DT-Logics.md` — it just needs a
  workflow file: `pnpm -r lint` → `test` → `build` → `check-zod`.
- No integration tests across packages (each package tests itself; nothing tests the
  SVG → GeoJSON → export round-trip that is the whole point of the suite).
- Coverage thresholds (80/85/85/85 in PACKAGE_STANDARDS.md) are not configured in any
  `vitest.config.ts`.
- The project-book has no completion tracking (checklists unticked, no issues) even though
  the work is largely done — mark pages done as part of the stabilization pass so the book
  reflects reality.
