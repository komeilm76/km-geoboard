# km-geoboard

> Monorepo of `km-*` TypeScript packages — artboard geometry, GeoJSON, SVG,
> map math, import/export pipelines, and a plugin system.

## Packages

| Package | Purpose |
|---|---|
| [`km-shared`](./packages/km-shared) | Result type, Zod utilities, IDE-safe structural types (foundation for all others) |
| [`km-artboard`](./packages/km-artboard) | Pure artboard geometry — create, resize, move, snap, query |
| [`km-geojson`](./packages/km-geojson) | RFC 7946 GeoJSON types, schemas, parsing, guards |
| [`km-svg`](./packages/km-svg) | SVG document/path parsing, serialization, SVG → GeoJSON |
| [`km-map`](./packages/km-map) | Projections, tiles, distance, bounds, scale, layers |
| [`km-imports`](./packages/km-imports) | Parse raw strings/objects into typed internal structures |
| [`km-exports`](./packages/km-exports) | Serialize artboard/map content to SVG, GeoJSON, OpenLayers, PDF meta, raster plans |
| [`km-plugins`](./packages/km-plugins) | Plugin registry, dependency resolver, debug snapshot |

## Toolchain

pnpm + Node >= 18 only. See the decision table in [`PACKAGE_STANDARDS.md`](./PACKAGE_STANDARDS.md).

```bash
pnpm install        # install the workspace
pnpm -r build       # build all packages (tsup → dist/)
pnpm -r test        # run all test suites (vitest)
pnpm -r lint        # type-check only (tsc --noEmit)
pnpm -r check-zod   # verify no Zod leaks into declaration files
```

## Design documents

- `dt_docs/` — per-domain design specs (DT-Artboard, DT-Zod, …)
- `project-book/` — chaptered implementation book
- `project-evaluation/` — audit, gaps, integration proposals, roadmap
- `zod_hang.md` — why Zod types must never reach published `.d.ts` files

## License

MIT
