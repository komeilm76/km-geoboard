# km-packages — Repository Standards

> **Normative.** This is the single source of truth for conventions in the
> km-geoboard monorepo. Where any other document (including `dt_docs/`) conflicts
> with this file, this file wins. Last updated: 2026-06-11 (post-Phase-A;
> reflects the pnpm toolchain, scoped naming, and Changesets workflow actually
> in use — the original Bun-based single-package template text is fully retired).

## 0. Decisions at a glance

| Question | Decision |
|---|---|
| Package manager / runtime | **pnpm + Node** (Bun is not part of the toolchain) |
| Node engines | **>= 18** |
| Package naming | **`@komeilm76/km-<name>`** (scoped, vueuse-style; `km-` is the brand prefix) |
| Folder naming | `packages/km-<name>` (folders keep the brand prefix) |
| Output directory | **`dist/` flat** — `index.js` (ESM), `index.cjs` (CJS), `index.d.ts` / `index.d.cts` |
| Builder | tsup with `dts: true` (tsc is lint-only, never emits) |
| tsconfig | root `tsconfig.base.json` + per-package `extends`, `noEmit: true` |
| Zod | `peerDependency >= 4.4.0`; zero Zod in any published `.d.ts` (see §6) |
| Versioning / releases | **Changesets** (`pnpm changeset` → release PR → tags + npm publish via CI) |
| Repository | github.com/komeilm76/km-geoboard (monorepo; per-package `repository.directory`) |

---

## 1. Monorepo layout

```
km-geoboard/
├── packages/km-<name>/        # one folder per published package
│   ├── src/                   # TypeScript sources only — never compiled output
│   │   └── index.ts           # single flat public surface
│   ├── tests/                 # Vitest suite, mirrors src/
│   ├── dist/                  # tsup output — gitignored, never committed
│   ├── package.json, tsconfig.json, tsup.config.ts, vitest.config.ts
│   ├── README.md, help.md, CHANGELOG.md, LICENSE
├── scripts/check-zod.mjs      # post-build declaration-file gate (§6)
├── .changeset/                # Changesets config + pending changesets
├── .github/workflows/         # ci.yml (verify), release.yml (version/publish)
├── dt_docs/                   # per-domain design specs
├── project-book/              # chaptered implementation book
├── project-evaluation/        # audit, gaps, proposals, roadmap
├── pnpm-workspace.yaml, tsconfig.base.json, package.json
```

Current packages: `km-shared` (foundation), `km-artboard`, `km-geojson`, `km-svg`,
`km-map`, `km-imports`, `km-exports`, `km-plugins`, and `km-geoboard` (umbrella —
re-exports all of the above under namespaces and hosts the integration test suite).

---

## 2. package.json (canonical shape)

```jsonc
{
  "name": "@komeilm76/km-<name>",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist", "src", "README.md", "LICENSE"],
  "engines": { "node": ">=18" },
  "publishConfig": { "access": "public" },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/komeilm76/km-geoboard.git",
    "directory": "packages/km-<name>"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "lint": "tsc --noEmit",
    "check-zod": "node ../../scripts/check-zod.mjs"
  },
  "dependencies": { "@komeilm76/km-shared": "workspace:*" },
  "peerDependencies": { "zod": ">=4.4.0" },
  "devDependencies": { "zod": "^4.4.0", "tsup": "^8.5.0", "typescript": "~5.9.2", "vitest": "^2.0.0" }
}
```

Rules:
- Workspace siblings are referenced as `workspace:*`; pnpm rewrites them to real
  versions at publish time.
- Zod is **always** a peerDependency, never a dependency (see `zod_hang.md` RULE 6).
- Never add `bun`-anything to scripts.

---

## 3. TypeScript configuration

Per-package `tsconfig.json` — identical in every package:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false
  },
  "include": ["src"]
}
```

`tsc` is for type-checking only (`pnpm lint`). It must never be able to emit —
this is what previously littered `src/` with 43 committed artifacts.
Strictness flags live in `tsconfig.base.json` (`strict`,
`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, …) and apply to all packages.

---

## 4. Build — tsup

Per-package `tsup.config.ts` — identical in every package:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
});
```

Output: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` +
`dist/index.d.cts`, plus sourcemaps. The `exports` map in §2 points at exactly
these paths. `pnpm -r build` builds in dependency order.

---

## 5. Tests — Vitest

- Tests live in `tests/`, named `<module>.test.ts`; import utilities explicitly
  (`import { describe, it, expect } from 'vitest'`).
- `environment: 'node'` unless a package genuinely needs a DOM.
- Workspace siblings are aliased to **source** in each `vitest.config.ts`
  (`'@komeilm76/km-shared': resolve(__dirname, '../km-shared/src/index.ts')`),
  so tests never depend on build order.
- Coverage minimums where configured: branches 80 %, functions/lines/statements 85 %.
- Numeric/geodesic tests use **relative** tolerances and document the reference
  formula and constants (e.g. WGS84 R = 6378137) next to the expectation.
- Test the real implementation — no mocking the module under test.

---

## 6. The Zod gate (IDE-safety)

Published declaration files must contain **zero** references to the `zod` module.
Full rationale: `zod_hang.md`; rules: `dt_docs/DT-Zod.md` §IDE-Safe Rules.

- Exported signatures use the structural types from
  `@komeilm76/km-shared` (`$SchemaOf<T>`, `$AnyZodType`, `$AnyZodObject`,
  `$ParseResult<T>`), never `z.*` types or `z.infer`.
- Inside function bodies and internal (non-exported) schema files, cast back
  freely: `schema as unknown as z.ZodNumber`.
- Enforcement: `pnpm -r check-zod` runs `scripts/check-zod.mjs` after build —
  it scans `dist/**/*.d.{ts,cts,mts}` for `import`/`require`/`from 'zod'`
  (ignoring comments) and fails the build on any hit. CI runs it on every push.

---

## 7. Code style — Prettier

```json
{ "tabWidth": 2, "semi": true, "singleQuote": true, "printWidth": 100 }
```

Run `pnpm fix` (root) before committing.

---

## 8. Versioning & releases — Changesets

Never edit `version` fields by hand and never run `npm publish` manually.

1. After a meaningful change: `pnpm changeset` — select affected packages,
   bump type (patch/minor/major), write a summary.
2. Commit the generated `.changeset/*.md` file together with the change.
3. On push to `main`, `.github/workflows/release.yml` (changesets/action) opens
   or updates a **"Version Packages" PR** that consumes pending changesets,
   bumps versions, and updates CHANGELOGs.
4. Merging that PR publishes changed packages to npm (`pnpm release` = build +
   test + check-zod + `changeset publish`) and creates per-package git tags
   (`@komeilm76/km-<name>@<version>`).

Requires the `NPM_TOKEN` repository secret (npm automation token).
Milestone tags like `v0.1.0` may additionally be created manually for
repo-level events (e.g. Phase completions).

---

## 9. Git conventions

- Conventional Commits: `feat:` `fix:` `chore:` `refactor:` `test:` `docs:`
  (+ `!` / `BREAKING CHANGE:` footer for breaking changes).
- `main` is stable and protected by CI (`ci.yml`: build, lint, test, check-zod
  on Node 18/20/22). Feature work merges via PR when collaboration starts.
- Never commit: `dist/`, `build/`, `node_modules/`, `.pnpm-store/`, compiled
  `.js`/`.d.ts`/`.map` inside `src/` or `tests/`, lockfiles other than
  `pnpm-lock.yaml` (which **is** committed).

---

## 10. New-package checklist

When adding `packages/km-<new>`:

- [ ] Folder `packages/km-<new>`, name `@komeilm76/km-<new>`
- [ ] Copy the canonical `package.json` shape (§2), `tsconfig.json` (§3),
      `tsup.config.ts` (§4), `vitest.config.ts` (§5) from an existing package
- [ ] `src/index.ts` single flat export surface; types and schemas in separate files
- [ ] Zod as peerDependency; structural types in exported signatures (§6)
- [ ] `README.md`, `help.md`, `CHANGELOG.md`, `LICENSE`
- [ ] Register nothing — `pnpm-workspace.yaml` already globs `packages/*`
- [ ] `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod` green
- [ ] Add a changeset describing the new package
