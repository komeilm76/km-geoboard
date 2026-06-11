# DT-Flexibility

> Package architecture — isomorphic TypeScript, dual ESM/CJS, browser and server compatibility.

> **Note (2026-06-11):** for toolchain, output paths, engines, and naming, the
> normative source is the decision table at the top of `PACKAGE_STANDARDS.md`.
> Where this document conflicts with that table, the table wins.

---

## Overview

This project is published as a **collection of TypeScript npm packages** under a monorepo.  
Every package works identically in:

- **Node.js** (server, CLI, build tools) — v18+
- **Browser** (bundled via Vite, Webpack, esbuild, Rollup)
- **Edge runtimes** (Cloudflare Workers, Deno, Bun) — where Web Crypto is available

There is **no DOM dependency** anywhere in the core packages.  
No `document`, no `window`, no `HTMLElement`, no CSS.  
If a consumer wants to connect a package to a canvas, that is their responsibility.

---

## Monorepo Structure

```
/
├── packages/
│   ├── shared/           ← Utility types, Zod utils, result types
│   ├── artboard/         ← Artboard geometry functions
│   ├── geojson/          ← GeoJSON types and Zod schemas
│   ├── svg/              ← SVG attribute types and Zod schemas
│   ├── map/              ← Map coordinate math, projection utils
│   ├── imports/          ← Parsers: GeoJSON, SVG, OpenLayers formats
│   ├── exports/          ← Serializers: SVG, GeoJSON, OpenLayers, PDF meta
│   └── plugins/          ← Plugin system and registry
├── package.json          ← Workspace root
├── tsconfig.base.json    ← Shared TS config
├── vitest.config.ts      ← Shared test config
└── README.md
```

Each package is independently publishable to npm as `@yourscope/<name>`.

---

## Each Package Structure

```
packages/<name>/
├── src/
│   ├── types.ts          ← TypeScript types (no Zod imports)
│   ├── schemas.ts        ← Zod schemas
│   ├── index.ts          ← Public re-exports
│   └── *.ts              ← Implementation files
├── tests/
│   └── *.test.ts         ← Vitest tests
├── dist/                 ← Generated output (gitignored)
├── help.md               ← Human-readable API documentation
├── CHANGELOG.md
├── README.md
├── package.json
└── tsconfig.json
```

---

## `package.json` Per Package

```json
{
  "name": "@yourscope/artboard",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs",
      "types": "./dist/types/index.d.ts"
    }
  },
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build":   "tsup",
    "test":    "vitest run",
    "lint":    "tsc --noEmit",
    "check-zod": "grep -rn \"^import.*zod\" dist/ && echo 'ZOD LEAK DETECTED' || echo 'Clean'"
  },
  "peerDependencies": {
    "zod": ">=4.4.0"
  },
  "devDependencies": {
    "zod": "^4.4.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Build Tool: `tsup`

Each package uses `tsup` to produce:

- `dist/esm/` — ESM output (`.js` + `.d.ts`)
- `dist/cjs/` — CommonJS output (`.cjs` + `.d.ts`)

```ts
// tsup.config.ts (per package)
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
```

---

## TypeScript Config

### Root `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2020"]
  }
}
```

**No `DOM` lib.** Packages that need `crypto.randomUUID()` use the `@types/node` or the Web Crypto API which is now available in all targets.

### Per-package `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist/types"
  },
  "include": ["src"]
}
```

---

## Isomorphic `crypto.randomUUID()`

For UUID generation that works in all environments:

```ts
/**
 * Returns a UUID v4 string.
 * Works in Node 14.17+, all modern browsers, Deno, Bun, and Cloudflare Workers.
 */
function generateId(): string {
  // Available in Node >= 14.17, browsers (2021+), and edge runtimes
  return crypto.randomUUID();
}
```

If the project ever needs to support older environments, replace with the `uuid` package:

```ts
import { v4 as uuidv4 } from "uuid";
function generateId(): string { return uuidv4(); }
```

---

## No DOM Rule

The `lib` option in `tsconfig.base.json` never includes `"DOM"`.  
This ensures that any accidental use of browser-only APIs (`document`, `window`, `localStorage`, `HTMLElement`) causes a **compile-time error** rather than a silent runtime failure in Node.

If a consumer wants to use an artboard origin as an SVG `viewBox` attribute on a real DOM element, they write that connection themselves — this library gives them the number tuple; the rendering is their concern.

---

## Dependency Philosophy

| Type | Policy |
|---|---|
| `zod` | Always `peerDependency` |
| `uuid` (if used) | `dependency` — small, stable |
| Any map library (MapLibre, Leaflet) | Never a dependency — consumers bring their own |
| Any canvas/rendering library | Never a dependency |
| Node built-ins | Used directly when available; never polyfilled |

The goal is **zero mandatory runtime dependencies** in most packages.  
`shared` may have `zod` as a peer. Everything else depends only on `shared`.

---

## Workspace Commands

```bash
# Install all packages
pnpm install

# Build all packages
pnpm -r build

# Run all tests
pnpm -r test

# Check for Zod leaks in all dist outputs
pnpm -r check-zod

# Type-check all packages
pnpm -r lint
```

---

## Versioning

Each package is versioned independently following **semver**.  
A shared `CHANGELOG.md` in the root summarizes cross-package changes.  
Each package has its own `CHANGELOG.md` for package-specific history.

Breaking changes (major version bumps) must be documented with a migration guide in the changelog.
