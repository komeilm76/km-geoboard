/**
 * @file createPluginRegistry.ts
 * Factory function that creates a PluginRegistry instance.
 *
 * The registry manages a private Map of active registrations and implements
 * the full PluginRegistry interface. The internal Map is never exposed —
 * the returned plain object is the only way to interact with the registry.
 *
 * Dependency version checking is performed by `satisfiesVersion` imported from
 * dependencyResolver.ts. There is no circular dependency:
 *   createPluginRegistry → dependencyResolver → types (terminal).
 */

import type {
  Plugin,
  PluginDepsMap,
  PluginId,
  PluginRegistration,
  PluginRegistry,
  Result,
} from './types';
import { satisfiesVersion } from './dependencyResolver';

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates and returns a new, empty `PluginRegistry` instance.
 *
 * The registry is implemented as a closure over a private `Map`. Insertion
 * order is preserved — `list()` and `reset()` both rely on this guarantee.
 *
 * @example
 * const registry = createPluginRegistry();
 * const result = registry.register(myPlugin);
 * if (result.success) {
 *   const api = registry.getApi<MyApi>("com.project.my-plugin");
 * }
 */
export function createPluginRegistry(): PluginRegistry {
  // Private state — never exposed to callers.
  const registrations = new Map<PluginId, PluginRegistration>();

  return {
    // ── register ─────────────────────────────────────────────────────────────
    register<API extends Record<string, unknown>>(
      plugin: Plugin<API>,
    ): Result<PluginRegistration<API>> {
      // ① Duplicate check
      if (registrations.has(plugin.id)) {
        return {
          success: false,
          error: {
            code: 'already-registered',
            message: `Plugin "${plugin.id}" is already registered.`,
          },
        };
      }

      // ② Conflict check
      for (const conflict of plugin.conflicts ?? []) {
        if (registrations.has(conflict.pluginId)) {
          return {
            success: false,
            error: {
              code: 'conflict',
              message: `Plugin "${plugin.id}" conflicts with registered plugin "${conflict.pluginId}": ${conflict.reason}`,
            },
          };
        }
      }

      // ③ Dependency check (presence + version)
      for (const dep of plugin.dependencies ?? []) {
        const existing = registrations.get(dep.pluginId);

        if (!existing) {
          if (!dep.optional) {
            return {
              success: false,
              error: {
                code: 'missing-dependency',
                message: `Plugin "${plugin.id}" requires "${dep.pluginId}" (>=${dep.minVersion}) but it is not registered.`,
              },
            };
          }
          // Optional dep not present — skip silently.
          continue;
        }

        // Dependency is registered — check version.
        if (!satisfiesVersion(existing.plugin.version, dep.minVersion)) {
          return {
            success: false,
            error: {
              code: 'version-mismatch',
              message: `Plugin "${plugin.id}" requires "${dep.pluginId}" ${dep.minVersion} but found version ${existing.plugin.version}.`,
            },
          };
        }
      }

      // ④ Build PluginDepsMap from resolved dependency APIs.
      const depsMap: PluginDepsMap = new Map();
      for (const dep of plugin.dependencies ?? []) {
        const existing = registrations.get(dep.pluginId);
        if (existing) {
          depsMap.set(dep.pluginId, existing.api as Record<string, unknown>);
        }
      }

      // ⑤ Call plugin.setup — catch any thrown error.
      let api: API;
      try {
        api = plugin.setup(depsMap);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          error: {
            code: 'setup-error',
            message: `Plugin "${plugin.id}" setup threw: ${message}`,
          },
        };
      }

      // ⑥ Store and return the registration.
      const registration: PluginRegistration<API> = {
        plugin,
        api,
        status: 'active',
      };

      // Store as the widened type the Map expects.
      registrations.set(plugin.id, registration as unknown as PluginRegistration);

      return { success: true, data: registration };
    },

    // ── unregister ────────────────────────────────────────────────────────────
    unregister(id: PluginId): Result<void> {
      const registration = registrations.get(id);

      if (!registration) {
        return {
          success: false,
          error: {
            code: 'not-found',
            message: `Plugin "${id}" is not registered.`,
          },
        };
      }

      // Check that no other active plugin requires this one as a non-optional dependency.
      for (const [otherId, otherReg] of registrations) {
        if (otherId === id) continue;
        for (const dep of otherReg.plugin.dependencies ?? []) {
          if (dep.pluginId === id && !dep.optional) {
            return {
              success: false,
              error: {
                code: 'dependency-active',
                message: `Cannot unregister "${id}": plugin "${otherId}" depends on it.`,
              },
            };
          }
        }
      }

      // Call teardown if defined; ignore any error (isolated failure principle).
      try {
        registration.plugin.teardown?.();
      } catch {
        // Teardown errors are intentionally swallowed.
      }

      registrations.delete(id);
      return { success: true, data: undefined };
    },

    // ── getApi ────────────────────────────────────────────────────────────────
    getApi<API extends Record<string, unknown>>(id: PluginId): API | null {
      // Intentional unchecked cast — the Map stores Record<string, unknown> values
      // because TypeScript cannot enforce per-key API types in a heterogeneous Map.
      // The caller is responsible for supplying the correct API type parameter.
      return (registrations.get(id)?.api as API) ?? null;
    },

    // ── has ───────────────────────────────────────────────────────────────────
    has(id: PluginId): boolean {
      return registrations.has(id);
    },

    // ── list ──────────────────────────────────────────────────────────────────
    list(): PluginRegistration[] {
      return Array.from(registrations.values());
    },

    // ── reset ─────────────────────────────────────────────────────────────────
    reset(): void {
      // Tear down in reverse insertion order so later-registered plugins
      // (which may depend on earlier ones) are torn down first.
      const all = Array.from(registrations.values()).reverse();
      for (const reg of all) {
        try {
          reg.plugin.teardown?.();
        } catch {
          // Teardown errors are intentionally swallowed.
        }
      }
      registrations.clear();
    },
  };
}
