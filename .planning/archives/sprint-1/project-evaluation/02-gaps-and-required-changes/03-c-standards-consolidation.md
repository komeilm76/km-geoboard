# C. Standards consolidation (decide once, write down, enforce)

The repo currently carries two incompatible conventions. Resolve every row and record the
decision in a single authoritative file (proposal: keep `PACKAGE_STANDARDS.md` as the only
normative doc and amend `DT-Flexibility.md` to defer to it, or vice versa):

| Question | Option 1 (PACKAGE_STANDARDS.md) | Option 2 (DT-Flexibility.md) | Recommendation |
|---|---|---|---|
| Package manager | Bun | pnpm | **pnpm** (CI-friendly, already root) |
| Output dir | `build/` (cjs+esm+js triple) | `dist/` (esm+cjs) | **`dist/` esm+cjs** — the universal-`js` third format adds little for these consumers |
| Node engines | ≥14 | ≥18 | **≥18** (crypto.randomUUID, modern targets) |
| Naming | `km-*` unscoped | `@yourscope/*` | **`km-*`** (already 7 of 8) |
| tsconfig style | template root tsconfig | `tsconfig.base.json` + extends | **base + extends** (already in place) |
| Versioning | release-it per package | independent semver, no tool named | release-it or **changesets** (better for monorepos) |
