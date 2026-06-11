/**
 * km-plugins — Plugin system for km-packages.
 *
 * Provides a typed plugin registry with dependency resolution, conflict detection,
 * semver version checking, and lifecycle management (setup/teardown).
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createPluginRegistry } from 'km-plugins';
 * import type { Plugin } from 'km-plugins';
 *
 * type GreeterApi = { greet: (name: string) => string };
 *
 * const greeterPlugin: Plugin<GreeterApi> = {
 *   id: 'com.project.greeter',
 *   name: 'Greeter',
 *   version: '1.0.0',
 *   setup(_deps) {
 *     return { greet: (name) => `Hello, ${name}!` };
 *   },
 * };
 *
 * const registry = createPluginRegistry();
 * registry.register(greeterPlugin);
 *
 * const api = registry.getApi<GreeterApi>('com.project.greeter');
 * console.log(api?.greet('world')); // Hello, world!
 * ```
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  Result,
  ResultError,
  PluginId,
  PluginVersion,
  PluginDependency,
  PluginConflict,
  PluginDepsMap,
  Plugin,
  PluginRegistration,
  PluginRegistry,
  RegistrySnapshot,
} from './types';

// ── Factory ──────────────────────────────────────────────────────────────────
export { createPluginRegistry } from './createPluginRegistry';

// ── Dependency resolver ──────────────────────────────────────────────────────
export { satisfiesVersion, resolveDependencyOrder } from './dependencyResolver';

// ── Debug ────────────────────────────────────────────────────────────────────
export { debugRegistry } from './debugRegistry';
