# km-geoboard

> Monorepo of `km-*` TypeScript packages — artboard geometry, GeoJSON, SVG,
> map math, import/export pipelines, and a plugin system.

## Packages

All packages are published under the `@komeilm76` scope with the `km-` brand prefix
(vueuse-style): `import { createArtboard } from '@komeilm76/km-artboard'`.

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](./packages/km-geoboard) | **Umbrella package** — all of the below under namespaces, one install; hosts the integration test suite |
| [`@komeilm76/km-shared`](./packages/km-shared) | Result type, Zod utilities, IDE-safe structural types (foundation for all others) |
| [`@komeilm76/km-artboard`](./packages/km-artboard) | Pure artboard geometry — create, resize, move, snap, query |
| [`@komeilm76/km-geojson`](./packages/km-geojson) | RFC 7946 GeoJSON types, schemas, parsing, guards |
| [`@komeilm76/km-svg`](./packages/km-svg) | SVG document/path parsing, serialization, SVG → GeoJSON |
| [`@komeilm76/km-map`](./packages/km-map) | Projections, tiles, distance, bounds, scale, layers |
| [`@komeilm76/km-imports`](./packages/km-imports) | Parse raw strings/objects into typed internal structures |
| [`@komeilm76/km-exports`](./packages/km-exports) | Serialize artboard/map content to SVG, GeoJSON, OpenLayers, PDF meta, raster plans |
| [`@komeilm76/km-plugins`](./packages/km-plugins) | Plugin registry, dependency resolver, debug snapshot |

## Toolchain

pnpm + Node >= 18 only. See the decision table in [`PACKAGE_STANDARDS.md`](./.planning/PACKAGE_STANDARDS.md).

```bash
pnpm install        # install the workspace
pnpm -r build       # build all packages (tsup → dist/)
pnpm -r test        # run all test suites (vitest)
pnpm -r lint        # type-check only (tsc --noEmit)
pnpm -r check-zod   # verify no Zod leaks into declaration files
```

## Planning & design documents

All planning, design docs, and work tracking live in [`.planning/`](./.planning/README.md)
— **read `.planning/README.md` before working on this repo.** It contains:

- `tasks.md`, `backlog.md`, `issues.md`, `targets.md` — status-tracked work items
- `rules.md`, `checklists.md`, `hints.md` — how to work here
- `PACKAGE_STANDARDS.md` — normative package standards
- `zod_hang.md` — why Zod types must never reach published `.d.ts` files
- `assigned_sources/` — inbox: drop new specs/notes/tasks here for the next session
- `archives/` — completed work by sprint (project-book, dt_docs, project-evaluation), read-only

## License

MIT
