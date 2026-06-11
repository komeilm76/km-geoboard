# DT-Plugins

> Plugin system design — modular extensibility, dependency management, conflict resolution, and lifecycle.

---

## Overview

The plugin system allows the project to grow indefinitely without creating a tightly coupled monolith.  
Every major capability is a **plugin** — a well-defined unit with declared dependencies, explicit inputs/outputs, and a standard lifecycle.

The plugin registry is the central coordinator. It:
- Registers plugins
- Resolves dependency order
- Detects conflicts before they cause bugs
- Provides a typed API surface for each plugin's public interface

There is no magic, no implicit global state, no class inheritance hierarchy.  
A plugin is a plain object that conforms to the `Plugin` interface.

---

## Design Principles

1. **Explicit over implicit** — every dependency is declared, not inferred.
2. **Fail early** — conflicts and missing dependencies are caught at registration time, not at runtime.
3. **No circular dependencies** — the dependency graph must be a DAG (directed acyclic graph).
4. **Pure plugin logic** — plugins may hold state, but their exported functions must be pure where possible.
5. **Versioned interfaces** — a plugin declares the version of the API it exposes, allowing consumers to handle upgrades.
6. **Isolated failures** — a failing plugin must not crash other plugins.

---

## Types

### `PluginId`

```ts
/** Unique plugin identifier — reverse-domain notation recommended. */
type PluginId = string;
// e.g. "com.yourproject.artboard", "com.yourproject.map.tiles"
```

### `PluginVersion`

```ts
/** Semantic version string. */
type PluginVersion = string;
// e.g. "1.0.0", "2.3.1"
```

### `PluginDependency`

```ts
type PluginDependency = {
  /** The plugin ID this plugin depends on. */
  pluginId: PluginId;

  /**
   * Minimum required version (inclusive).
   * Uses semver range syntax.
   * @example ">=1.0.0"
   */
  minVersion: string;

  /**
   * Whether this dependency is optional.
   * If optional and not present, the plugin loads without it.
   * @default false
   */
  optional?: boolean;
};
```

### `PluginConflict`

```ts
type PluginConflict = {
  /** A plugin ID that must NOT be present when this plugin is registered. */
  pluginId: PluginId;
  reason: string;
};
```

### `Plugin<API>`

```ts
/**
 * A plugin definition.
 * `API` is the shape of the public interface this plugin exposes.
 */
type Plugin<API extends Record<string, unknown> = Record<string, unknown>> = {
  /** Unique plugin identifier. */
  id: PluginId;

  /** Plugin display name for debugging and documentation. */
  name: string;

  /** Plugin version (semver). */
  version: PluginVersion;

  /**
   * Declared dependencies. The registry resolves these before calling `setup`.
   */
  dependencies?: PluginDependency[];

  /**
   * Plugins this plugin conflicts with.
   * If any listed plugin is already registered, registration fails.
   */
  conflicts?: PluginConflict[];

  /**
   * Called by the registry after all dependencies are resolved.
   * Must return the plugin's public API object.
   *
   * @param deps - A map from dependency plugin ID to that plugin's resolved API.
   */
  setup(deps: PluginDepsMap): API;

  /**
   * Called when the plugin is unregistered or the registry is reset.
   * Use to clean up timers, close connections, etc.
   */
  teardown?(): void;
};
```

### `PluginDepsMap`

```ts
/**
 * Map of resolved dependency APIs, keyed by plugin ID.
 * Passed to `Plugin.setup` at registration time.
 */
type PluginDepsMap = Map<PluginId, Record<string, unknown>>;
```

### `PluginRegistration<API>`

```ts
/**
 * A registered plugin — the plugin definition plus its resolved public API.
 */
type PluginRegistration<API extends Record<string, unknown> = Record<string, unknown>> = {
  plugin: Plugin<API>;
  api: API;
  status: "active" | "error";
  error?: string;
};
```

---

## Plugin Registry

### `PluginRegistry`

```ts
/**
 * Central plugin registry.
 * Manages registration, dependency resolution, and teardown.
 */
type PluginRegistry = {
  /**
   * Register a plugin.
   * Validates dependencies and conflicts, then calls `plugin.setup`.
   *
   * @returns Result<PluginRegistration>
   */
  register<API extends Record<string, unknown>>(
    plugin: Plugin<API>
  ): Result<PluginRegistration<API>>;

  /**
   * Unregister a plugin by ID.
   * Calls `plugin.teardown()` if defined.
   * Fails if other active plugins depend on this one.
   *
   * @returns Result<void>
   */
  unregister(id: PluginId): Result<void>;

  /**
   * Retrieve the resolved API of a registered plugin.
   *
   * @returns The plugin's API, or null if not registered.
   */
  getApi<API extends Record<string, unknown>>(id: PluginId): API | null;

  /**
   * Returns true if a plugin with the given ID is currently active.
   */
  has(id: PluginId): boolean;

  /**
   * Returns all active plugin registrations.
   */
  list(): PluginRegistration[];

  /**
   * Unregisters all plugins (in reverse dependency order) and resets the registry.
   */
  reset(): void;
};
```

### `createPluginRegistry`

Factory function — creates a new, empty plugin registry.

```ts
/**
 * Creates and returns a new PluginRegistry instance.
 *
 * @example
 * const registry = createPluginRegistry();
 * registry.register(myPlugin);
 */
function createPluginRegistry(): PluginRegistry
```

---

## Dependency Resolution

When a plugin is registered:

1. Check all `conflicts` — if any listed plugin is active, return a conflict error.
2. Resolve all `dependencies`:
   - If a required dependency is missing, return a missing-dependency error.
   - If a dependency's version does not satisfy `minVersion`, return a version-mismatch error.
   - If a dependency is `optional` and missing, it is excluded from `deps` passed to `setup`.
3. Build the `PluginDepsMap` from resolved dependency APIs.
4. Call `plugin.setup(deps)` and store the returned API.
5. Mark the registration as `active`.

If any step fails, the plugin is not registered and an error result is returned.  
No partial state is left behind.

---

## Conflict Resolution

Conflicts are declared by the plugin that cares about them:

```ts
const myPlugin: Plugin<MyAPI> = {
  id: "com.project.renderer.webgl",
  name: "WebGL Renderer",
  version: "1.0.0",
  conflicts: [
    {
      pluginId: "com.project.renderer.canvas2d",
      reason: "Cannot use WebGL and Canvas2D renderers simultaneously.",
    },
  ],
  setup(deps) { ... },
};
```

If `com.project.renderer.canvas2d` is already registered when this plugin is registered, registration fails with a `conflict` error and a message that includes the `reason`.

---

## Error Codes

| Code | Meaning |
|---|---|
| `conflict` | A conflicting plugin is already registered |
| `missing-dependency` | A required dependency is not registered |
| `version-mismatch` | A dependency's version does not satisfy the requirement |
| `circular-dependency` | The dependency graph contains a cycle (detected at registration) |
| `setup-error` | The plugin's `setup` function threw an error |
| `dependency-active` | Cannot unregister — other active plugins depend on this one |

---

## Example: Writing a Plugin

```ts
import { createPluginRegistry, Plugin } from "@yourscope/plugins";

// Plugin A — provides a coordinate converter
type CoordConverterApi = {
  toMercator: (latLng: LatLng) => MercatorPoint;
};

const coordConverterPlugin: Plugin<CoordConverterApi> = {
  id: "com.project.coord-converter",
  name: "Coordinate Converter",
  version: "1.0.0",
  setup(_deps) {
    return {
      toMercator: latLngToMercator,
    };
  },
};

// Plugin B — depends on Plugin A
type TileServiceApi = {
  getTileUrl: (latLng: LatLng, zoom: number) => string;
};

const tileServicePlugin: Plugin<TileServiceApi> = {
  id: "com.project.tile-service",
  name: "Tile Service",
  version: "1.0.0",
  dependencies: [
    { pluginId: "com.project.coord-converter", minVersion: ">=1.0.0" },
  ],
  setup(deps) {
    const coords = deps.get("com.project.coord-converter") as CoordConverterApi;
    return {
      getTileUrl(latLng, zoom) {
        const { x, y } = coords.toMercator(latLng);
        return `https://tiles.example.com/${zoom}/${x}/${y}.png`;
      },
    };
  },
};

// Usage
const registry = createPluginRegistry();
registry.register(coordConverterPlugin);
registry.register(tileServicePlugin);

const tileApi = registry.getApi<TileServiceApi>("com.project.tile-service");
console.log(tileApi?.getTileUrl({ lat: 51.5, lng: -0.12 }, 12));
```

---

## Debugging

### `debugRegistry`

Returns a plain object snapshot of the current registry state for logging.

```ts
type RegistrySnapshot = {
  plugins: Array<{
    id: PluginId;
    name: string;
    version: PluginVersion;
    status: "active" | "error";
    dependencies: PluginId[];
    error?: string;
  }>;
  dependencyOrder: PluginId[];
};

function debugRegistry(registry: PluginRegistry): RegistrySnapshot
```

---

## File Location

```
packages/
  plugins/
    src/
      types.ts              ← Plugin, PluginRegistry, PluginRegistration, etc.
      schemas.ts
      createPluginRegistry.ts
      dependencyResolver.ts ← DAG resolution, cycle detection
      debugRegistry.ts
      index.ts
    tests/
      createPluginRegistry.test.ts
      dependencyResolver.test.ts
    help.md
```
