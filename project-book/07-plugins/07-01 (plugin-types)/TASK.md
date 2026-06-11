# Page 07-01 — Plugin Types

## Summary
Creates the `@yourscope/plugins` package and defines every type the plugin
system needs: `PluginId`, `PluginVersion`, `PluginDependency`, `PluginConflict`,
`Plugin<API>`, `PluginDepsMap`, `PluginRegistration<API>`, `PluginRegistry`,
and `RegistrySnapshot`. No implementation — types only.

## Target
`packages/plugins/src/types.ts` exports all plugin types.
Package skeleton builds cleanly.

## Dependencies
- Page 00-01, 00-02 — monorepo and shared types only.
  The plugin system has no dependency on any domain package.

## Inputs
- `DT-Plugins.md` — complete type definitions for every plugin concept.

## Outputs

| File | Purpose |
|---|---|
| `packages/plugins/src/types.ts` | All plugin TypeScript types |
| `packages/plugins/src/index.ts` | Public re-exports |
| `packages/plugins/package.json` | Package manifest |
| `packages/plugins/tsconfig.json` | Extends root config |
| `packages/plugins/tsup.config.ts` | Build config |
| `packages/plugins/help.md` | Documentation stub |
| `packages/plugins/CHANGELOG.md` | Version history |
| `packages/plugins/README.md` | npm display page |

## Step-by-Step Instructions

1. Create `packages/plugins/src/types.ts`. No Zod imports.

2. Define primitive type aliases with JSDoc:
   ```ts
   /** Unique plugin identifier — reverse-domain notation recommended. */
   export type PluginId = string;

   /** Semantic version string, e.g. "1.0.0". */
   export type PluginVersion = string;
   ```

3. Define `PluginDependency`:
   `pluginId`, `minVersion` (semver range string), `optional?: boolean`.

4. Define `PluginConflict`:
   `pluginId`, `reason: string`.

5. Define `PluginDepsMap`:
   `Map<PluginId, Record<string, unknown>>`.

6. Define `Plugin<API extends Record<string, unknown>>`:
   - `id: PluginId`
   - `name: string`
   - `version: PluginVersion`
   - `dependencies?: PluginDependency[]`
   - `conflicts?: PluginConflict[]`
   - `setup(deps: PluginDepsMap): API`
   - `teardown?(): void`
   JSDoc every field.

7. Define `PluginRegistration<API extends Record<string, unknown>>`:
   - `plugin: Plugin<API>`
   - `api: API`
   - `status: "active" | "error"`
   - `error?: string`

8. Define `PluginRegistry` as a type (interface-style) with 6 methods:
   - `register<API>(plugin: Plugin<API>): Result<PluginRegistration<API>>`
   - `unregister(id: PluginId): Result<void>`
   - `getApi<API>(id: PluginId): API | null`
   - `has(id: PluginId): boolean`
   - `list(): PluginRegistration[]`
   - `reset(): void`
   JSDoc every method with param and return descriptions.

9. Define `RegistrySnapshot` for the `debugRegistry` function:
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
   ```

10. Export all types from `index.ts`.

11. Create `packages/plugins/package.json`:
    - `"name": "@yourscope/plugins"`, `"version": "0.1.0"`.
    - Dependency: `@yourscope/shared` only.
    - `zod` as peer + dev.
    - `check-zod` script.

12. Create all other package files. Build.

## Acceptance Criteria

- [ ] All 9 types exported from `types.ts`
- [ ] `Plugin<API>` has generic constraint `API extends Record<string, unknown>`
- [ ] `Plugin.setup` receives `PluginDepsMap` and returns `API`
- [ ] `PluginRegistry` is a type with all 6 method signatures
- [ ] `register` returns `Result<PluginRegistration<API>>`
- [ ] `getApi` returns `API | null`
- [ ] `RegistrySnapshot` type defined
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `PluginDepsMap` is typed as `Map<PluginId, Record<string, unknown>>`.
  This is the loosest possible type for the resolved API — each plugin is
  responsible for casting `deps.get("id") as MyApi` in its own `setup` function.
  This avoids circular type references between plugin definitions.
- `PluginRegistry` is defined as a `type` (not a `class`). The class that
  implements it lives in `createPluginRegistry.ts` and is never exported.
  Consumers only see and use the `PluginRegistry` interface.
