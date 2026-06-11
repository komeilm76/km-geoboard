# Page 01-04 — Snap to Grid

## Summary
Implements `snapArtboardToGrid` — rounds an artboard's `origin` and `size`
to the nearest grid line. Supports three snapping modes: `"round"` (nearest),
`"floor"` (towards origin), and `"ceil"` (away from origin).

## Target
`packages/km-artboard/src/snapArtboardToGrid.ts` exists and exports
`snapArtboardToGrid`. All edge cases (zero grid, negative coordinates) are
handled. Tests pass.

## Dependencies
- Page 01-01 (artboard-types) — `SnapArtboardInput`, `Artboard`
- Page 01-02 (create-artboard) — package is already wired up

## Inputs
- `DT-Artboard.md` — `snapArtboardToGrid` spec, `SnapArtboardInput` definition.
- `DT-Logics.md` — pure function rule, immutability rule.

## Outputs

| File | Purpose |
|---|---|
| `packages/km-artboard/src/snapArtboardToGrid.ts` | Function implementation |
| `packages/km-artboard/tests/snapArtboardToGrid.test.ts` | Vitest tests |

## Step-by-Step Instructions

1. Create `packages/km-artboard/src/snapArtboardToGrid.ts`.
2. Function signature: `snapArtboardToGrid(input: SnapArtboardInput): Artboard`.
   (This function cannot fail — snapping is always valid.)
3. Destructure with defaults:
   ```ts
   const { artboard, gridSize = 8, mode = "round" } = input;
   ```
4. Validate `gridSize > 0`. If `gridSize <= 0`, return the artboard unchanged
   (defensive guard — no error, just a no-op).
5. Create a `snap` helper function that snaps a single number:
   ```ts
   function snap(value: number): number {
     switch (mode) {
       case "floor": return Math.floor(value / gridSize) * gridSize;
       case "ceil":  return Math.ceil(value  / gridSize) * gridSize;
       default:      return Math.round(value / gridSize) * gridSize;
     }
   }
   ```
6. Apply snap to `origin.x`, `origin.y`, `size.width`, `size.height`.
7. Return a new artboard with snapped values:
   ```ts
   return {
     ...artboard,
     origin: { x: snap(artboard.origin.x), y: snap(artboard.origin.y) },
     size:   { width: snap(artboard.size.width), height: snap(artboard.size.height) },
   };
   ```
8. Add JSDoc with all three mode examples.
9. Export from `packages/km-artboard/src/index.ts`.

10. Create `packages/km-artboard/tests/snapArtboardToGrid.test.ts`.
    Write tests covering:
    - `"round"` mode: value exactly at midpoint snaps up (0.5 * gridSize).
    - `"round"` mode: value below midpoint snaps down.
    - `"floor"` mode: value snaps down regardless of position.
    - `"ceil"` mode: value snaps up regardless of position.
    - Default `gridSize` is `8`.
    - Custom `gridSize` (e.g. `16`, `10`).
    - Negative `origin` values snap correctly in all modes.
    - Zero values stay zero.
    - `gridSize <= 0` returns the artboard unchanged (defensive guard).
    - Snapping does not mutate the input artboard.
    - All other artboard fields (`id`, `name`, `createdAt`, etc.) are preserved.

11. Run `pnpm --filter @komeilm76/km-artboard test` and build.

## Acceptance Criteria

- [ ] `snapArtboardToGrid` is a pure function (no mutation)
- [ ] Default `gridSize` is `8`
- [ ] Default `mode` is `"round"`
- [ ] `"round"` mode snaps to nearest grid line
- [ ] `"floor"` mode always snaps towards smaller values
- [ ] `"ceil"` mode always snaps towards larger values
- [ ] Negative coordinates snap correctly in all modes
- [ ] `gridSize <= 0` is handled safely (returns artboard unchanged)
- [ ] All non-geometry fields (`id`, `name`, `createdAt`) are preserved unchanged
- [ ] JSDoc documents all three modes with examples
- [ ] All tests pass
- [ ] Build succeeds, Zod-leak check passes

## Notes
- Snapping does not revalidate against `minSize` — the result may produce a
  size of zero if the artboard is very small. This is intentional: snapping is
  a layout operation, not a creation operation. If the consumer needs to guard
  against zero sizes after snapping, they call `resizeArtboard` afterward.
- `Math.round` in JavaScript rounds half-up for positive values
  (e.g. `Math.round(0.5) === 1`) but half-toward-even is not guaranteed for
  negative values in all environments. Test negative mid-point behavior explicitly.
- The `snap` helper is defined inside the function body — it captures `mode` and
  `gridSize` via closure. It should not be exported.
