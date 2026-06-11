/**
 * @file debugRegistry.ts
 * Diagnostic function that returns a plain-object snapshot of the registry state.
 *
 * This is a free function, not part of the PluginRegistry interface, so that
 * the registry itself stays minimal and consumers who don't need debugging
 * don't pay the cost.
 */

import type { PluginRegistry, RegistrySnapshot } from './types';

/**
 * Returns a plain-object snapshot of the current registry state for logging
 * and debugging.
 *
 * The snapshot is serializable (no Maps, no class instances) and safe to
 * pass to `JSON.stringify`.
 *
 * @param registry - The registry instance to snapshot.
 * @returns A `RegistrySnapshot` describing every registered plugin and the
 *   order in which they were registered.
 *
 * @example
 * const registry = createPluginRegistry();
 * registry.register(pluginA);
 * registry.register(pluginB);
 *
 * const snapshot = debugRegistry(registry);
 * console.log(JSON.stringify(snapshot, null, 2));
 */
export function debugRegistry(registry: PluginRegistry): RegistrySnapshot {
  const all = registry.list();

  return {
    plugins: all.map((r) => ({
      id: r.plugin.id,
      name: r.plugin.name,
      version: r.plugin.version,
      status: r.status,
      dependencies: r.plugin.dependencies?.map((d) => d.pluginId) ?? [],
      // exactOptionalPropertyTypes: only include `error` when defined
      ...(r.error !== undefined ? { error: r.error } : {}),
    })),
    dependencyOrder: all.map((r) => r.plugin.id),
  };
}
