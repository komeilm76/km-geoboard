# Page 01-01 — Artboard Types

## Summary
Creates the `@komeilm76/km-artboard` package skeleton and defines every TypeScript
type the artboard domain needs: `Point`, `Size`, `Artboard`, all input types,
and all result types. No logic lives here — only the data shapes that every
artboard function will operate on.

## Target
`packages/km-artboard/src/types.ts` exports all artboard types.
`packages/km-artboard/src/index.ts` re-exports them.
The package builds cleanly with zero TypeScript errors and zero Zod imports
in `dist/`.

## Dependencies
- Page 00-01 (monorepo-setup)
- Page 00-02 (shared-types) — `Result<T>` must exist in `@komeilm76/km-shared`

## Inputs
- `DT-Artboard.md` — complete type definitions for `Point`, `Size`, `Artboard`,
  `CreateArtboardInput`, `CreateArtboardResult`, `ResizeArtboardInput`,
  `MoveArtboardInput`, `SnapArtboardInput`.
- `DT-Inputs-and-Outputs.md` — output shape rules (IDs as strings, timestamps
  as numbers, no `undefined` in output types).

## Outputs

| File | Purpose |
|---|---|
| `packages/km-artboard/src/types.ts` | All artboard TypeScript types |
| `packages/km-artboard/src/index.ts` | Public re-exports (types only for now) |
| `packages/km-artboard/package.json` | Package manifest |
| `packages/km-artboard/tsconfig.json` | Extends root config |
| `packages/km-artboard/tsup.config.ts` | Build config |
| `packages/km-artboard/help.md` | API documentation stub |
| `packages/km-artboard/CHANGELOG.md` | Version history |
| `packages/km-artboard/README.md` | npm/GitHub display page |

## Step-by-Step Instructions

1. Create `packages/km-artboard/src/types.ts`.
2. Define and export `Point`:
   ```ts
   export type Point = { x: number; y: number };
   ```
3. Define and export `Size`:
   ```ts
   export type Size = { width: number; height: number };
   ```
4. Define and export `Artboard` with all fields from `DT-Artboard.md`:
   `id`, `name`, `origin`, `size`, `startPoint`, `endPoint`, `createdAt`.
   Add JSDoc to every field including the `@default` annotations.
5. Define and export `CreateArtboardInput` with optional `name`, `id`, `minSize`.
   JSDoc every field with its `@default`.
6. Define and export `CreateArtboardResult` as the discriminated union:
   `{ success: true; artboard: Artboard } | { success: false; reason: "too-small" | "invalid-input" }`.
7. Define and export `ResizeArtboardInput` with `artboard`, optional `origin`,
   optional `size`, optional `minSize`.
8. Define and export `MoveArtboardInput` with `artboard` and `delta`.
9. Define and export `SnapArtboardInput` with `artboard`, optional `gridSize`,
   optional `mode` (`"round" | "floor" | "ceil"`).
10. Create `packages/km-artboard/src/index.ts` exporting all types:
    ```ts
    export type {
      Point, Size, Artboard,
      CreateArtboardInput, CreateArtboardResult,
      ResizeArtboardInput, MoveArtboardInput, SnapArtboardInput,
    } from "./types";
    ```
11. Create `packages/km-artboard/package.json`:
    - `"name": "@komeilm76/km-artboard"`
    - `"version": "0.1.0"`
    - Add `@komeilm76/km-shared` as a `dependency`.
    - Add `zod` as `peerDependency` and `devDependency`.
    - Include `check-zod` script.
12. Create `packages/km-artboard/tsconfig.json` extending root config.
13. Create `packages/km-artboard/tsup.config.ts`.
14. Write `packages/km-artboard/help.md` stub (Overview + Types section, functions TBD).
15. Create `packages/km-artboard/CHANGELOG.md` with `## [0.1.0]` heading.
16. Create `packages/km-artboard/README.md`.
17. Run `pnpm --filter @komeilm76/km-artboard build`. Confirm success.

## Acceptance Criteria

- [x] All 9 types are defined and exported
- [x] `Artboard.id` is `string`
- [x] `Artboard.createdAt` is `number` (Unix ms)
- [x] `Artboard.origin` and `Artboard.startPoint` / `Artboard.endPoint` are `Point`
- [x] `CreateArtboardInput` optional fields each have `@default` JSDoc
- [x] `CreateArtboardResult` is a discriminated union with `reason` (not `error.code`)
- [x] `SnapArtboardInput.mode` has all three literal values
- [x] Build succeeds with no TypeScript errors
- [x] `grep -rn "^import.*zod" packages/km-artboard/dist/` returns empty

## Notes
- Note that `CreateArtboardResult` uses `reason` (not `error`) per the spec in
  `DT-Artboard.md` — it is a slightly simpler shape than the generic `Result<T>`.
  Later, `resizeArtboard` returns the same union.
- `Point`, `Size` are defined here (not in `@komeilm76/km-shared`) because they are
  artboard-domain concepts. The map package will define its own `LatLng`, etc.
- No Zod in this file — `types.ts` must never import Zod. Schemas live in the
  next page's `schemas.ts`.
