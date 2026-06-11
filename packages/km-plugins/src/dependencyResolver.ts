/**
 * @file dependencyResolver.ts
 * Semver range checking and topological sort (Kahn's algorithm) for the plugin system.
 *
 * `satisfiesVersion` — checks whether a plugin version satisfies a `>=X.Y.Z` range.
 * `resolveDependencyOrder` — sorts a list of plugins into dependency-safe registration order
 *   and detects circular dependencies.
 *
 * Full semver range parsing (`^`, `~`, `||`, `<`, `<=`, `>`) is intentionally not
 * implemented. The `">=X.Y.Z"` subset covers the vast majority of real-world use cases.
 * A future version can replace this with the `semver` npm package if broader range
 * support is required.
 */

import type { Plugin, Result } from './types';

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Compares two semver strings numerically.
 *
 * @returns Positive if `a > b`, negative if `a < b`, zero if equal.
 */
function compareSemver(a: string, b: string): number {
  const parseVersion = (v: string): [number, number, number] => {
    const parts = v.split('.').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  };

  const [aMaj, aMin, aPat] = parseVersion(a);
  const [bMaj, bMin, bPat] = parseVersion(b);

  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns `true` if `version` satisfies the semver `range`.
 *
 * **Supported operators:** `>=X.Y.Z` only.
 * For any other operator (`>`, `<`, `<=`, `^`, `~`, `||`), this function
 * returns `false` as a conservative safe default. Unsupported ranges are
 * documented and will be addressed in a future version.
 *
 * @param version - The installed plugin version, e.g. `"1.2.3"`.
 * @param range - The semver range requirement, e.g. `">=1.0.0"`.
 *
 * @example
 * satisfiesVersion("1.2.3", ">=1.0.0") // true
 * satisfiesVersion("0.9.0", ">=1.0.0") // false
 * satisfiesVersion("1.0.0", ">=1.0.0") // true — equal boundary is accepted
 * satisfiesVersion("2.0.0", "^1.0.0")  // false — unsupported operator
 */
export function satisfiesVersion(version: string, range: string): boolean {
  if (!range.startsWith('>=')) {
    // Unsupported range operator — return false (conservative safe default).
    return false;
  }

  const min = range.slice(2).trim();
  return compareSemver(version, min) >= 0;
}

/**
 * Sorts a list of plugins into a dependency-safe registration order using
 * Kahn's topological sort algorithm.
 *
 * If plugin B declares a dependency on plugin A, A will appear before B in
 * the returned order. This guarantees that when `register` is called in the
 * returned order, all dependencies are already registered.
 *
 * Returns a `"circular-dependency"` error if the dependency graph contains
 * a cycle (i.e., it is not a DAG).
 *
 * @param plugins - The list of plugins to sort.
 * @returns `Result<Plugin[]>` — success with plugins in safe order, or a
 *   `"circular-dependency"` error.
 *
 * @example
 * const result = resolveDependencyOrder([pluginB, pluginA]);
 * if (result.success) {
 *   for (const plugin of result.data) {
 *     registry.register(plugin);
 *   }
 * }
 */
export function resolveDependencyOrder(plugins: Plugin[]): Result<Plugin[]> {
  // Build index: pluginId → plugin
  const pluginMap = new Map<string, Plugin>();
  for (const p of plugins) {
    pluginMap.set(p.id, p);
  }

  // Build in-degree map and adjacency list.
  // Adjacency: dep → set of plugins that depend on dep (i.e., dep must come first)
  const inDegree = new Map<string, number>();
  // dependents[depId] = set of plugin IDs that list depId as a dependency
  const dependents = new Map<string, Set<string>>();

  for (const p of plugins) {
    if (!inDegree.has(p.id)) inDegree.set(p.id, 0);
    if (!dependents.has(p.id)) dependents.set(p.id, new Set());

    for (const dep of p.dependencies ?? []) {
      // Only consider dependencies that are part of this batch.
      if (!pluginMap.has(dep.pluginId)) continue;

      // This plugin depends on dep.pluginId → dep.pluginId must come first.
      inDegree.set(p.id, (inDegree.get(p.id) ?? 0) + 1);

      if (!dependents.has(dep.pluginId)) {
        dependents.set(dep.pluginId, new Set());
      }
      dependents.get(dep.pluginId)!.add(p.id);
    }
  }

  // Kahn's algorithm — start with all zero-in-degree nodes.
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: Plugin[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    const plugin = pluginMap.get(id);
    if (plugin) sorted.push(plugin);

    // Decrement in-degree for all plugins that depend on this one.
    for (const dependentId of dependents.get(id) ?? []) {
      const newDegree = (inDegree.get(dependentId) ?? 0) - 1;
      inDegree.set(dependentId, newDegree);
      if (newDegree === 0) {
        queue.push(dependentId);
      }
    }
  }

  // If any plugin remains with non-zero in-degree, there is a cycle.
  if (sorted.length !== plugins.length) {
    const cycleIds = [...inDegree.entries()]
      .filter(([, degree]) => degree > 0)
      .map(([id]) => id)
      .join(', ');

    return {
      success: false,
      error: {
        code: 'circular-dependency',
        message: `Circular dependency detected among plugins: ${cycleIds}`,
      },
    };
  }

  return { success: true, data: sorted };
}
