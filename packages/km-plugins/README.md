# km-plugins

Typed plugin registry for km-packages. Provides dependency resolution, conflict detection, semver version checking, and plugin lifecycle management (setup/teardown).

## Install

```bash
npm install @komeilm76/km-plugins
```

## Quick start

```typescript
import { createPluginRegistry } from '@komeilm76/km-plugins';
import type { Plugin } from '@komeilm76/km-plugins';

type GreeterApi = { greet: (name: string) => string };

const greeterPlugin: Plugin<GreeterApi> = {
  id: 'com.project.greeter',
  name: 'Greeter',
  version: '1.0.0',
  setup(_deps) {
    return { greet: (name) => `Hello, ${name}!` };
  },
};

const registry = createPluginRegistry();
const result = registry.register(greeterPlugin);

if (result.success) {
  const api = registry.getApi<GreeterApi>('com.project.greeter');
  console.log(api?.greet('world')); // Hello, world!
}
```

## Dependency resolution

```typescript
import { resolveDependencyOrder, createPluginRegistry } from '@komeilm76/km-plugins';

// Sort plugins into safe registration order before registering them.
const order = resolveDependencyOrder([pluginC, pluginA, pluginB]);
if (order.success) {
  for (const plugin of order.data) {
    registry.register(plugin);
  }
}
```

## Error codes

| Code | When |
|---|---|
| `already-registered` | A plugin with the same ID is already registered |
| `conflict` | A conflicting plugin is already registered |
| `missing-dependency` | A required dependency is not registered |
| `version-mismatch` | A dependency version does not satisfy the requirement |
| `circular-dependency` | The dependency graph contains a cycle |
| `setup-error` | `plugin.setup` threw an error |
| `not-found` | Target of `unregister` is not registered |
| `dependency-active` | Cannot unregister — another plugin depends on the target |

See [help.md](./help.md) for full API documentation.
