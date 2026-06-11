# Changesets

Version and release management for the km-* packages.

Workflow:
1. After a meaningful change: `pnpm changeset` — pick affected packages and bump type (patch/minor/major), write a summary.
2. `pnpm version-packages` — consumes pending changesets, bumps versions, updates CHANGELOGs and inter-package `workspace:*` ranges.
3. `pnpm release` — builds, tests, and publishes changed packages to npm, creating git tags (km-<name>@<version>).

In CI, `.github/workflows/release.yml` automates steps 2–3 via a "Version Packages" PR.
