# Page 07-02 — Plugin Registry

## Summary
Implements `createPluginRegistry` — the factory function that creates a
`PluginRegistry` instance. The registry manages a Map of active registrations
and implements all 6 methods of the `PluginRegistry` interface. Dependency
resolution and cycle detection are handled in the next page.

## Target
`packages/km-plugins/src/createPluginRegistry.ts` exports `createPluginRegistry`.
Basic registration (no dependencies, no conflicts) is fully working and tested.
Conflict detection is also implemented here.

## Dependencies
- Page 07-01 (plugin-types)

## Inputs
- `DT-Plugins.md` — full `createPluginRegistry` spec, error codes table,
  dependency resolution algorithm (partial — full algorithm in 07-03).

## Outputs

| File | Purpose |
|---|---|
| `packages/km-plugins/src/createPluginRegistry.ts` | Registry implementation |
| `packages/km-plugins/tests/createPluginRegistry.test.ts` | Tests |

## Step-by-Step Instructions

1. Create `packages/km-plugins/src/createPluginRegistry.ts`.

2. The factory function returns a closure over a private `Map`:
   ```ts
   export function createPluginRegistry(): PluginRegistry {
     const registrations = new Map<PluginId, PluginRegistration>();

     return {
       register(plugin) { ... },
       unregister(id) { ... },
       getApi(id) { ... },
       has(id) { ... },
       list() { ... },
       reset() { ... },
     };
   }
   ```
   The `Map` is never exposed. The returned object is the only interface.

3. Implement `register<API>(plugin: Plugin<API>): Result<PluginRegistration<API>>`:

   a. **Duplicate check** — if `registrations.has(plugin.id)`, return error
      `{ code: "already-registered" }`.

   b. **Conflict check** — for each entry in `plugin.conflicts`:
      if `registrations.has(conflict.pluginId)`, return error
      `{ code: "conflict", message: conflict.reason }`.

   c. **Dependency check** (basic, without version comparison for now):
      for each required dependency in `plugin.dependencies`:
      if `!dependency.optional && !registrations.has(dep.pluginId)`, return error
      `{ code: "missing-dependency", message: "..." }`.
      *(Version comparison comes in page 07-03.)*

   d. **Build `PluginDepsMap`** — for each dependency, get the resolved API from
      the corresponding registration and add it to a new `Map`.

   e. **Call `plugin.setup(depsMap)`** — wrap in try/catch.
      On error, return `{ code: "setup-error", message: error.message }`.

   f. **Store registration**:
      ```ts
      const registration: PluginRegistration<API> = {
        plugin,
        api: setupResult,
        status: "active",
      };
      registrations.set(plugin.id, registration);
      return { success: true, data: registration };
      ```

4. Implement `unregister(id: PluginId): Result<void>`:
   - If not registered, return `{ code: "not-found" }` error.
   - Check that no other active plugin lists this `id` as a required dependency.
     If any does, return `{ code: "dependency-active" }` error.
   - Call `plugin.teardown?.()` — wrapped in try/catch (ignore teardown errors).
   - Delete from `registrations`.
   - Return `{ success: true, data: undefined }`.

5. Implement `getApi<API>(id: PluginId): API | null`:
   Return `(registrations.get(id)?.api as API) ?? null`.

6. Implement `has`, `list`, `reset` trivially.
   `reset` calls teardown on all plugins in reverse order (reverse of registration order).

7. Export `createPluginRegistry` from `index.ts`.

8. Write `tests/createPluginRegistry.test.ts`:
   - Register a plugin with no deps → success, `has()` returns true.
   - `getApi` returns the setup result.
   - `list` returns all registrations.
   - Register a conflicting plugin → error `"conflict"`.
   - Register a plugin with a missing required dep → error `"missing-dependency"`.
   - Plugin `setup` throws → error `"setup-error"`.
   - Unregister a plugin → success, `has()` returns false, `teardown` called.
   - Unregister a plugin that another depends on → error `"dependency-active"`.
   - `reset` clears all registrations and calls all `teardown` functions.
   - Optional dependency missing → still registers successfully.

## Acceptance Criteria

- [x] `createPluginRegistry` returns a `PluginRegistry`
- [x] Duplicate registration returns error
- [x] Conflict detection works correctly
- [x] Missing required dependency returns error
- [x] Missing optional dependency is allowed
- [x] `setup` exceptions are caught and returned as errors
- [x] `unregister` calls `teardown`
- [x] `unregister` blocked when other plugins depend on the target
- [x] `reset` calls `teardown` on all and clears the map
- [x] All tests pass, build clean

## Notes
- The registry's internal `Map` uses insertion order for iteration. `reset`
  iterates in reverse insertion order — this ensures that plugins whose `setup`
  ran later are torn down first (correct teardown dependency order).
- `getApi<API>` uses an unchecked cast. This is intentional and is the only
  `as API` in the codebase that is not in a function body — it is the one
  place where the type system cannot enforce safety, because the Map stores
  `Record<string, unknown>` values. Document this in a comment.
