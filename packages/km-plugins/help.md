# km-plugins

## Overview

`km-plugins` provides a typed plugin registry for the km-packages monorepo. Every major capability is a plugin — a plain object with a declared ID, version, dependencies, and a `setup` function that returns its public API. The registry validates the dependency graph at registration time (no runtime surprises), resolves dependencies in topological order, detects conflicts and cycles, and manages plugin teardown.

## Installation

```bash
npm install @komeilm76/km-plugins
```

## Functions

### `createPluginRegistry`

Creates and returns a new, empty `PluginRegistry` instance.

**Input:** none

**Output:** `PluginRegistry`

**Example:**
```typescript
import { createPluginRegistry } from '@komeilm76/km-plugins';
const registry = createPluginRegistry();
```

---

### `registry.register`

Registers a plugin. Validates conflicts and dependencies, then calls `plugin.setup`.

**Input**

| Field | Type | Required | Description |
|---|---|---|---|
| `plugin` | `Plugin<API>` | yes | Plugin definition to register |

**Output:** `Result<PluginRegistration<API>>`

**Error codes:** `already-registered`, `conflict`, `missing-dependency`, `version-mismatch`, `circular-dependency`, `setup-error`

**Example:**
```typescript
const result = registry.register(myPlugin);
if (!result.success) {
  console.error(result.error.code, result.error.message);
  return;
}
const api = result.data.api;
```

---

### `registry.unregister`

Unregisters a plugin by ID. Calls `plugin.teardown()` if defined.

**Input**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `PluginId` | yes | ID of the plugin to unregister |

**Output:** `Result<void>`

**Error codes:** `not-found`, `dependency-active`

---

### `registry.getApi`

Retrieves the resolved public API of a registered plugin.

**Input**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `PluginId` | yes | Plugin ID to look up |

**Output:** `API | null`

**Example:**
```typescript
const api = registry.getApi<MyApi>('com.project.my-plugin');
if (api) api.doSomething();
```

---

### `registry.has`

Returns `true` if a plugin with the given ID is currently registered.

**Input:** `id: PluginId`

**Output:** `boolean`

---

### `registry.list`

Returns all registered plugin registrations in insertion order.

**Output:** `PluginRegistration[]`

---

### `registry.reset`

Unregisters all plugins in reverse registration order, calling teardown on each.

**Output:** `void`

---

### `satisfiesVersion`

Checks whether a plugin version satisfies a semver range.

**Supported operators:** `>=X.Y.Z` only. All other operators return `false`.

**Input**

| Param | Type | Description |
|---|---|---|
| `version` | `string` | The installed version, e.g. `"1.2.3"` |
| `range` | `string` | The semver range, e.g. `">=1.0.0"` |

**Output:** `boolean`

**Example:**
```typescript
satisfiesVersion('1.2.3', '>=1.0.0'); // true
satisfiesVersion('0.9.0', '>=1.0.0'); // false
```

---

### `resolveDependencyOrder`

Sorts a list of plugins into a dependency-safe registration order (topological sort). Detects cycles.

**Input:** `plugins: Plugin[]`

**Output:** `Result<Plugin[]>`

**Error codes:** `circular-dependency`

**Example:**
```typescript
const result = resolveDependencyOrder([pluginC, pluginA, pluginB]);
if (result.success) {
  for (const p of result.data) registry.register(p);
}
```

---

### `debugRegistry`

Returns a plain-object snapshot of the registry state for logging.

**Input:** `registry: PluginRegistry`

**Output:** `RegistrySnapshot`

**Example:**
```typescript
console.log(JSON.stringify(debugRegistry(registry), null, 2));
```

---

## Types

### `Plugin<API>`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `PluginId` | yes | Unique identifier (reverse-domain recommended) |
| `name` | `string` | yes | Display name |
| `version` | `PluginVersion` | yes | Semver version string |
| `dependencies` | `PluginDependency[]` | no | Required/optional dependencies |
| `conflicts` | `PluginConflict[]` | no | Plugins that must not be co-registered |
| `setup` | `(deps: PluginDepsMap) => API` | yes | Returns the plugin's public API |
| `teardown` | `() => void` | no | Called on unregister/reset |

### `PluginDependency`

| Field | Type | Required | Description |
|---|---|---|---|
| `pluginId` | `PluginId` | yes | ID of the dependency |
| `minVersion` | `string` | yes | Semver range, e.g. `">=1.0.0"` |
| `optional` | `boolean` | no | If true, missing dep is allowed |

### `PluginConflict`

| Field | Type | Required | Description |
|---|---|---|---|
| `pluginId` | `PluginId` | yes | Conflicting plugin ID |
| `reason` | `string` | yes | Human-readable conflict reason |

### `PluginRegistration<API>`

| Field | Type | Description |
|---|---|---|
| `plugin` | `Plugin<API>` | Original plugin definition |
| `api` | `API` | Resolved public API |
| `status` | `"active" \| "error"` | Registration status |
| `error` | `string \| undefined` | Error message if status is "error" |

### `RegistrySnapshot`

| Field | Type | Description |
|---|---|---|
| `plugins` | `Array<{id, name, version, status, dependencies, error?}>` | All registered plugins |
| `dependencyOrder` | `PluginId[]` | IDs in registration order |

## Errors

| Code | Description |
|---|---|
| `already-registered` | Plugin ID already exists in the registry |
| `conflict` | A conflicting plugin is already registered |
| `missing-dependency` | A required dependency is not registered |
| `version-mismatch` | Registered dependency version does not satisfy the range |
| `circular-dependency` | The dependency graph has a cycle |
| `setup-error` | `plugin.setup()` threw an error |
| `not-found` | Target of `unregister` is not in the registry |
| `dependency-active` | Cannot unregister — another plugin depends on the target |
