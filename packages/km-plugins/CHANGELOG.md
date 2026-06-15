# Changelog

## 0.1.3

### Patch Changes

- b3fd5fc: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [b3fd5fc]
  - @komeilm76/km-shared@0.1.2

## 0.1.2

### Patch Changes

- 31dd255: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [31dd255]
  - @komeilm76/km-shared@0.1.1

## 0.1.1

### Patch Changes

- b8074de: De-island km-exports and km-plugins (Phase B, P1 canonical dependency graph).

  - `km-exports/src/types.ts` no longer redefines Artboard, SVG, GeoJSON, and
    Result types locally — they are imported from `@komeilm76/km-shared`,
    `@komeilm76/km-artboard`, `@komeilm76/km-svg`, and `@komeilm76/km-geojson`
    and re-exported under the same public names (GeoJson-prefixed aliases for
    Position/BoundingBox/LinearRing). Only export-specific types remain local.
  - `GeoJsonFeatureCollection` in km-exports is now the canonical type extended
    with the export-specific OpenLayers `crs` annotation.
  - `km-plugins/src/types.ts` no longer carries a local `Result`/`ResultError`
    copy — it imports and re-exports them from `@komeilm76/km-shared` (new
    workspace dependency).
  - Removed leftover `release-it` scripts/devDependency from km-exports and
    km-plugins; devDependencies aligned with .planning/PACKAGE_STANDARDS.md §2.

## [0.1.0] - 2026-06-11

### Added

- `PluginId`, `PluginVersion`, `PluginDependency`, `PluginConflict`, `PluginDepsMap` type aliases
- `Plugin<API>` generic type — plugin definition with `setup` and optional `teardown`
- `PluginRegistration<API>` type — registered plugin paired with its resolved API
- `PluginRegistry` interface type — 6-method interface for the registry
- `RegistrySnapshot` type — plain-object snapshot for debugging
- `Result<T>` / `ResultError` types (local copy; will source from `km-shared` once available)
- `createPluginRegistry()` — factory function returning a `PluginRegistry` instance
  - Duplicate, conflict, missing-dependency, version-mismatch, setup-error detection
  - `unregister` with teardown and dependency-active guard
  - `reset` with reverse-order teardown
- `satisfiesVersion(version, range)` — `>=X.Y.Z` semver range checker
- `resolveDependencyOrder(plugins)` — Kahn's topological sort with cycle detection
- `debugRegistry(registry)` — returns a `RegistrySnapshot` for logging
