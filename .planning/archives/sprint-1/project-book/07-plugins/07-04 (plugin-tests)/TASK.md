# Page 07-04 — Plugin Package Finalization

## Summary
Completes the plugin package: writes the full `help.md` with the complete API
reference and a worked end-to-end plugin authoring example, updates
`CHANGELOG.md`, and runs the full CI checklist. This is the final page of
the entire project book.

## Target
`packages/km-plugins/help.md` is complete. All tests pass. CI passes across the
entire monorepo. Every package's Zod-leak check returns empty.

## Dependencies
- Page 07-03 (dependency-resolver) — all plugin functions must exist and pass tests.

## Inputs
- `DT-Plugins.md` — all type specs, registry behavior, example plugin code.
- `DT-Logics.md` — `help.md` required sections.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-plugins/help.md` | Complete API documentation |
| `packages/km-plugins/CHANGELOG.md` | Updated with all 07-xx additions |

## Step-by-Step Instructions

1. Write `packages/km-plugins/help.md`:

   **Overview** — "A lightweight plugin system for modular extensibility.
   Plugins declare dependencies, expose typed APIs, and are managed by a central
   registry that resolves dependency order and detects conflicts and cycles."

   **Installation** — `npm install @komeilm76/km-plugins`.

   **Quick Start** — a complete two-plugin example showing:
   - Define Plugin A with no dependencies.
   - Define Plugin B that depends on Plugin A.
   - Create a registry with `createPluginRegistry()`.
   - Register both plugins in the correct order.
   - Call `registry.getApi<BApi>("plugin-b-id")` and use the result.

   **Functions**:
   - `createPluginRegistry()` — returns a `PluginRegistry`, no args, example.
   - `resolveDependencyOrder(plugins)` — input, output `Result<Plugin[]>`, cycle example.
   - `satisfiesVersion(version, range)` — input table, output boolean, examples.
   - `debugRegistry(registry)` — input, output `RegistrySnapshot`, example.

   **Registry Methods** — one subsection per method:
   `register`, `unregister`, `getApi`, `has`, `list`, `reset`.
   Each: signature, description, return value, example.

   **Writing a Plugin** — step-by-step tutorial:
   1. Define the API type.
   2. Define the plugin object conforming to `Plugin<API>`.
   3. Declare dependencies and their versions.
   4. Implement `setup(deps)` — get dependency APIs, return the plugin's API.
   5. Optionally implement `teardown()`.
   6. Register with the registry.

   **Error Codes** — table of all 6 error codes from `DT-Plugins.md`:
   `conflict`, `missing-dependency`, `version-mismatch`, `circular-dependency`,
   `setup-error`, `dependency-active`.

   **Design Principles** — reproduce the 6 principles from `DT-Plugins.md`
   (explicit, fail-early, no cycles, pure logic, versioned, isolated).

2. Update `packages/km-plugins/CHANGELOG.md`.

3. Run the full CI suite for the plugins package:
   ```bash
   pnpm --filter @komeilm76/km-plugins lint
   pnpm --filter @komeilm76/km-plugins test
   pnpm --filter @komeilm76/km-plugins build
   grep -rn "^import.*zod" packages/km-plugins/dist/
   ```

4. Run the **entire monorepo** CI suite:
   ```bash
   pnpm -r lint
   pnpm -r test
   pnpm -r build
   pnpm -r check-zod
   ```
   All must pass. This is the final project sign-off.

## Acceptance Criteria

- [x] `help.md` has all required sections including Writing a Plugin tutorial
- [x] Quick Start shows a two-plugin end-to-end example
- [x] All 6 error codes documented
- [x] All 6 design principles documented
- [x] `CHANGELOG.md` updated with all additions from pages 07-01 to 07-04
- [x] `pnpm --filter @komeilm76/km-plugins lint` — zero errors
- [x] `pnpm --filter @komeilm76/km-plugins test` — all green
- [x] `pnpm --filter @komeilm76/km-plugins build` — succeeds
- [x] `grep -rn "^import.*zod" packages/km-plugins/dist/` — empty
- [x] `pnpm -r lint` — zero errors across all packages
- [x] `pnpm -r test` — all tests green across all packages
- [x] `pnpm -r build` — all packages build successfully
- [x] `pnpm -r check-zod` — empty output for every package

## Notes
- This is the last page of the project book.
- When all 40 pages are checked off and the full monorepo CI suite passes,
  the project is complete and ready to publish.
- Before publishing each package, verify once more:
  1. `package.json` version is correct for the initial release.
  2. `CHANGELOG.md` has an entry for the published version.
  3. `help.md` accurately describes what was actually built.
  4. `dist/` was built from the latest source (run `pnpm -r build` fresh).
  5. `grep -rn "^import.*zod" dist/` returns empty for each package.
- Publish order must respect dependencies:
  `shared` → `artboard`, `geojson` → `svg`, `map` → `imports`, `exports`, `plugins`.
