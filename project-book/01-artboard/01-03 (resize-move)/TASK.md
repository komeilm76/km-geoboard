# Page 01-03 — Resize and Move Functions

## Summary
Implements `resizeArtboard` and `moveArtboard` — the two mutation-style
functions that return new artboard objects with updated geometry. Also implements
`artboardToRect`, `artboardFromRect`, `artboardContainsPoint`, and
`artboardsOverlap` as geometric utility functions. All functions are pure and
return new objects without mutating inputs.

## Target
Six new source files exist, each exporting one function.
All are exported from `packages/km-artboard/src/index.ts`.
Tests exist for every function.

## Dependencies
- Page 01-02 (create-artboard) — `schemas.ts` exists, `createArtboard` works

## Inputs
- `DT-Artboard.md` — specs for `resizeArtboard`, `moveArtboard`, `artboardToRect`,
  `artboardFromRect`, `artboardContainsPoint`, `artboardsOverlap`.
- `DT-Logics.md` — immutability rule, pure function rule.
- `DT-Inputs-and-Outputs.md` — reversibility contract (`artboardToRect` /
  `artboardFromRect` are a forward/reverse pair).

## Outputs

| File | Purpose |
|---|---|
| `packages/km-artboard/src/resizeArtboard.ts` | `resizeArtboard` implementation |
| `packages/km-artboard/src/moveArtboard.ts` | `moveArtboard` implementation |
| `packages/km-artboard/src/artboardToRect.ts` | `artboardToRect` + `artboardFromRect` |
| `packages/km-artboard/src/artboardContainsPoint.ts` | `artboardContainsPoint` |
| `packages/km-artboard/src/artboardsOverlap.ts` | `artboardsOverlap` |
| `packages/km-artboard/tests/resizeArtboard.test.ts` | Tests |
| `packages/km-artboard/tests/moveArtboard.test.ts` | Tests |
| `packages/km-artboard/tests/artboardGeometry.test.ts` | Tests for rect, contains, overlap |

## Step-by-Step Instructions

### `resizeArtboard`
1. Create `packages/km-artboard/src/resizeArtboard.ts`.
2. Function signature: `resizeArtboard(input: ResizeArtboardInput): CreateArtboardResult`.
3. Merge `input.origin` into `artboard.origin` using spread (partial override).
4. Merge `input.size` into `artboard.size` using spread.
5. Apply `minSize` guard (default `1`) — same logic as `createArtboard`.
6. Return `{ success: true, artboard: { ...artboard, origin, size } }` on success.
7. Return `{ success: false, reason: "too-small" }` if either dimension < minSize.
8. Add JSDoc.

### `moveArtboard`
1. Create `packages/km-artboard/src/moveArtboard.ts`.
2. Function signature: `moveArtboard(input: MoveArtboardInput): Artboard`.
   (This function cannot fail — any delta is valid.)
3. Return:
   ```ts
   return {
     ...artboard,
     origin: {
       x: artboard.origin.x + delta.x,
       y: artboard.origin.y + delta.y,
     },
   };
   ```
4. Add JSDoc with `@example`.

### `artboardToRect` and `artboardFromRect`
1. Create `packages/km-artboard/src/artboardToRect.ts`.
2. `artboardToRect(artboard: Artboard): [number, number, number, number]`
   Returns `[origin.x, origin.y, size.width, size.height]`.
3. `artboardFromRect(rect, options?)` — calls `createArtboard` with
   `startPoint: { x: rect[0], y: rect[1] }` and
   `endPoint: { x: rect[0] + rect[2], y: rect[1] + rect[3] }`.
4. Verify the round-trip: `artboardToRect(artboardFromRect(rect).artboard!)` ≈ `rect`.
5. Add JSDoc to both, including the `@example` round-trip.

### `artboardContainsPoint`
1. Create `packages/km-artboard/src/artboardContainsPoint.ts`.
2. Function: `artboardContainsPoint(artboard: Artboard, point: Point): boolean`
3. Return true when:
   ```
   point.x >= origin.x &&
   point.x <= origin.x + size.width &&
   point.y >= origin.y &&
   point.y <= origin.y + size.height
   ```
   (inclusive on all edges per spec).

### `artboardsOverlap`
1. Create `packages/km-artboard/src/artboardsOverlap.ts`.
2. Function: `artboardsOverlap(a: Artboard, b: Artboard): boolean`
3. Two rectangles overlap when they are NOT separated on either axis:
   ```ts
   const noOverlap =
     a.origin.x + a.size.width  < b.origin.x ||
     b.origin.x + b.size.width  < a.origin.x ||
     a.origin.y + a.size.height < b.origin.y ||
     b.origin.y + b.size.height < a.origin.y;
   return !noOverlap;
   ```

### Export and test
4. Add all 6 exports to `packages/km-artboard/src/index.ts`.
5. Write tests for each function covering:
   - `resizeArtboard`: partial origin override, partial size override, `too-small` guard.
   - `moveArtboard`: positive delta, negative delta, zero delta (returns equal artboard).
   - `artboardToRect` / `artboardFromRect`: round-trip equality.
   - `artboardContainsPoint`: inside, on edge (all 4 edges), outside.
   - `artboardsOverlap`: overlapping, touching edge (counts as overlap), fully separated
     (both axes), one inside the other.
6. Run all tests and the build.

## Acceptance Criteria

- [ ] `resizeArtboard` merges partial origin and size without mutating input
- [ ] `resizeArtboard` applies `minSize` guard, returns `too-small` if violated
- [ ] `moveArtboard` returns new artboard with translated origin
- [ ] `moveArtboard` never mutates `input.artboard`
- [ ] `artboardToRect` returns `[x, y, w, h]` tuple
- [ ] `artboardFromRect` round-trips cleanly with `artboardToRect`
- [ ] `artboardContainsPoint` is inclusive on all edges
- [ ] `artboardsOverlap` returns true for touching edges
- [ ] All 6 functions exported from `index.ts`
- [ ] All tests pass
- [ ] No `any` in any signature
- [ ] Build succeeds, Zod-leak check passes

## Notes
- `moveArtboard` does not update `startPoint`/`endPoint` on the artboard — those
  remain as the original drag coordinates. Only `origin` changes.
- Touching edges (e.g. right edge of A = left edge of B) counts as overlap per
  the inclusive-boundary spec. Tests should verify this explicitly.
- `artboardFromRect` uses `createArtboard` internally, so it benefits from all
  the validation that `createArtboard` already does.
- The reversibility of `artboardToRect` / `artboardFromRect` is a contract.
  Document it in JSDoc and verify it in tests.
