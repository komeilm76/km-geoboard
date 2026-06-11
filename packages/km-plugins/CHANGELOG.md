# Changelog

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
