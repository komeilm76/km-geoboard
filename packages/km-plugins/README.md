# @komeilm76/km-plugins

Typed plugin registry for the km-geoboard suite (or any TypeScript app) — dependency resolution, conflict detection, semver checking, and lifecycle management (`setup`/`teardown`). No decorators, no class hierarchies, no globals: one factory function and plain objects.

Works in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-plugins zod
# or
pnpm add @komeilm76/km-plugins zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { createPluginRegistry } from '@komeilm76/km-plugins';
import type { Plugin } from '@komeilm76/km-plugins';

// 1. Define a plugin — `Plugin<API>` is generic over the API it exposes
type GreeterApi = { greet: (name: string) => string };

const greeterPlugin: Plugin<GreeterApi> = {
  id: 'com.project.greeter',     // reverse-domain notation recommended
  name: 'Greeter',
  version: '1.0.0',
  setup(_deps) {
    return { greet: (name) => `Hello, ${name}!` };
  },
};

// 2. Register it
const registry = createPluginRegistry();
const reg = registry.register(greeterPlugin);
if (!reg.success) console.error(reg.error.code); // e.g. 'already-registered'

// 3. Use its API anywhere
const api = registry.getApi<GreeterApi>('com.project.greeter');
console.log(api?.greet('world')); // "Hello, world!"
```

## Dependencies, versions, conflicts

```ts
const mapPlugin: Plugin<MapApi> = {
  id: 'com.project.map',
  name: 'Map',
  version: '2.1.0',
  dependencies: [
    { pluginId: 'com.project.coords', minVersion: '>=1.0.0' },           // required
    { pluginId: 'com.project.theme',  minVersion: '>=1.0.0', optional: true }, // loads without it
  ],
  conflicts: [
    { pluginId: 'com.legacy.map', reason: 'Replaces the legacy map plugin' },
  ],
  setup(deps) {
    // deps: Map<PluginId, API> of resolved required + present-optional deps
    const coords = deps.get('com.project.coords') as CoordApi;
    return makeMapApi(coords);
  },
  teardown() {
    // called on unregister() / reset() — clean up timers, listeners, …
  },
};
```

The registry refuses registration (returning an error `Result`, never partial state) when a required dependency is missing or version-mismatched, a declared conflict is already registered, or the dependency graph would contain a cycle.

## API

### `createPluginRegistry(): PluginRegistry`

| Method | Returns | Description |
|---|---|---|
| `register(plugin)` | `Result<PluginRegistration<API>>` | Validate conflicts + deps, call `setup`, store the API |
| `unregister(id)` | `Result<void>` | Call `teardown`, remove — fails if another active plugin requires it |
| `getApi<API>(id)` | `API \| null` | Resolved API of a registered plugin |
| `has(id)` | `boolean` | Registration check |
| `list()` | `PluginRegistration[]` | All active registrations, insertion order |
| `reset()` | `void` | Unregister everything in reverse order (teardown errors ignored) |

**`register` error codes:** `'already-registered'`, `'conflict'`, `'missing-dependency'`, `'version-mismatch'`, `'circular-dependency'`, `'setup-error'`.
**`unregister` error codes:** `'not-found'`, `'dependency-active'`.

### Dependency resolver (also exported standalone)

| Function | Description |
|---|---|
| `satisfiesVersion(version, range)` | Check a semver string against a `">=X.Y.Z"` range |
| `resolveDependencyOrder(plugins)` | Topological sort — returns a dependency-safe load order |

### `debugRegistry(registry): RegistrySnapshot`

Plain-object snapshot for logging: per-plugin `{ id, name, version, status, dependencies, error? }` plus the resolved `dependencyOrder`.

## Types

| Type | Description |
|---|---|
| `Plugin<API>` | Plugin definition: `id`, `name`, `version`, `dependencies?`, `conflicts?`, `setup(deps)`, `teardown?()` |
| `PluginId` / `PluginVersion` | `string` aliases (reverse-domain / semver) |
| `PluginDependency` | `{ pluginId, minVersion, optional? }` |
| `PluginConflict` | `{ pluginId, reason }` |
| `PluginDepsMap` | `Map<PluginId, Record<string, unknown>>` — passed to `setup`; cast each entry to its API type |
| `PluginRegistration<API>` | `{ plugin, api, status: 'active' \| 'error', error? }` |
| `PluginRegistry` | The registry interface (returned by the factory; never implemented by consumers) |
| `RegistrySnapshot` | Debug snapshot shape |

## Error handling

Every fallible method returns `Result<T>` from `@komeilm76/km-shared` — the registry never throws, and a failed `register` leaves no partial state behind.

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `plugins` namespace |
| [`@komeilm76/km-shared`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-shared) | The `Result<T>` type used throughout |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-plugins/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
