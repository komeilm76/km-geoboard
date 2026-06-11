# Page 07-03 — Dependency Resolver

## Summary
Implements `resolveDependencyOrder` — topological sort (Kahn's algorithm) that
validates the dependency graph is a DAG (no cycles) and returns plugins in safe
registration order. Also implements `satisfiesVersion` for semver range checking
and `debugRegistry` for snapshot logging.

## Target
`packages/km-plugins/src/dependencyResolver.ts` exports `resolveDependencyOrder`
and `satisfiesVersion`.
`packages/km-plugins/src/debugRegistry.ts` exports `debugRegistry`.
The registry is updated to use version checking.
All tests pass.

## Dependencies
- Page 07-02 (plugin-registry)

## Inputs
- `DT-Plugins.md` — dependency resolution algorithm, cycle detection, error codes,
  `debugRegistry` spec.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-plugins/src/dependencyResolver.ts` | `resolveDependencyOrder`, `satisfiesVersion` |
| `packages/km-plugins/src/debugRegistry.ts` | `debugRegistry` |
| `packages/km-plugins/tests/dependencyResolver.test.ts` | Tests |

## Step-by-Step Instructions

### `satisfiesVersion`
1. Implement `satisfiesVersion(version: string, range: string): boolean`.
   Handle the most common semver range format: `">=X.Y.Z"`.
   Parse both as `[major, minor, patch]` tuples and compare numerically.
   Return true if `version >= rangeMin` in semver order.
   For other range operators (`>`, `<`, `<=`, `^`, `~`), document them as
   "not yet supported" and return `false` (conservative safe default).

   ```ts
   export function satisfiesVersion(version: string, range: string): boolean {
     if (!range.startsWith(">=")) return false; // unsupported range
     const min = range.slice(2).trim();
     return compareSemver(version, min) >= 0;
   }

   function compareSemver(a: string, b: string): number {
     const [aMaj, aMin, aPat] = a.split(".").map(Number);
     const [bMaj, bMin, bPat] = b.split(".").map(Number);
     if (aMaj !== bMaj) return aMaj - bMaj;
     if (aMin !== bMin) return aMin - bMin;
     return aPat - bPat;
   }
   ```

2. Update `createPluginRegistry.register` to call `satisfiesVersion` when checking
   dependency versions. If `satisfiesVersion(registeredVersion, dep.minVersion)` is
   false, return `{ code: "version-mismatch" }` error.

### `resolveDependencyOrder`
3. Implement Kahn's algorithm for topological sort:
   ```ts
   export function resolveDependencyOrder(
     plugins: Plugin[]
   ): Result<Plugin[]>
   ```
   - Build an adjacency map (plugin ID → set of dependency IDs).
   - Build an in-degree map (plugin ID → count of dependencies).
   - Use a queue starting with all zero-in-degree plugins.
   - Iteratively pop from the queue, add to result, decrement in-degrees of dependents.
   - If any plugins remain with non-zero in-degree after the queue is empty →
     there is a cycle → return `{ code: "circular-dependency" }` error.

4. Update `createPluginRegistry.register` to call `resolveDependencyOrder` on the
   new plugin plus all its dependencies before proceeding with registration.

### `debugRegistry`
5. Implement `debugRegistry(registry: PluginRegistry): RegistrySnapshot`:
   ```ts
   export function debugRegistry(registry: PluginRegistry): RegistrySnapshot {
     const all = registry.list();
     return {
       plugins: all.map(r => ({
         id: r.plugin.id,
         name: r.plugin.name,
         version: r.plugin.version,
         status: r.status,
         dependencies: r.plugin.dependencies?.map(d => d.pluginId) ?? [],
         error: r.error,
       })),
       dependencyOrder: all.map(r => r.plugin.id),
     };
   }
   ```

6. Export all from `index.ts`.

7. Write `tests/dependencyResolver.test.ts`:
   - `satisfiesVersion("1.2.3", ">=1.0.0")` → true.
   - `satisfiesVersion("0.9.0", ">=1.0.0")` → false.
   - `satisfiesVersion("1.0.0", ">=1.0.0")` → true (equal is accepted).
   - `resolveDependencyOrder` with linear chain → correct order.
   - `resolveDependencyOrder` with diamond dependency → correct order.
   - `resolveDependencyOrder` with a cycle → `{ code: "circular-dependency" }`.
   - Registry integration: register plugin A, register plugin B that requires A >=1.0.0 → success.
   - Register B that requires A >=2.0.0 when A is 1.0.0 → `{ code: "version-mismatch" }`.

## Acceptance Criteria

- [ ] `satisfiesVersion` handles `">=X.Y.Z"` ranges correctly
- [ ] `satisfiesVersion` returns `false` for unsupported range operators
- [ ] `resolveDependencyOrder` returns plugins in topologically valid order
- [ ] `resolveDependencyOrder` detects cycles and returns `"circular-dependency"`
- [ ] Registry uses `satisfiesVersion` for version checks on dependency registration
- [ ] `debugRegistry` returns a `RegistrySnapshot` with all active plugins
- [ ] All tests pass, build clean

## Notes
- Implementing full semver range parsing (`^`, `~`, `||`, `<`, etc.) is complex.
  The `">=X.Y.Z"` subset covers the vast majority of real-world use cases.
  The limitation is documented in JSDoc. A future version can replace this with
  the `semver` npm package if needed.
- The topological sort guarantees that if plugin B depends on plugin A, A appears
  before B in the returned order. This is the order in which plugins should be
  registered to satisfy all dependencies.
- `debugRegistry` is a diagnostic function, not part of the registry interface.
  It is a free function that takes a `PluginRegistry` as its argument.
