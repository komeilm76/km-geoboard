# @komeilm76/km-artboard

Pure artboard geometry for 2D canvas applications — create, resize, move, snap, and query rectangular regions. No DOM, no events, no mutations: every function takes data and returns new data.

Works in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-artboard zod
# or
pnpm add @komeilm76/km-artboard zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { createArtboard, moveArtboard, resizeArtboard, snapArtboardToGrid } from '@komeilm76/km-artboard';

// Create from two drag points (any corner order — geometry is normalized)
const result = createArtboard({
  startPoint: { x: 100, y: 80 },
  endPoint:   { x: 400, y: 320 },
  name: 'Frame 1',
});

if (result.success) {
  const { artboard } = result;
  // artboard.origin → { x: 100, y: 80 }   (top-left, always normalized)
  // artboard.size   → { width: 300, height: 240 } (always positive)
  // artboard.id     → generated UUID v4

  // Move by a delta vector (returns a NEW artboard)
  const moved = moveArtboard({ artboard, delta: { x: 50, y: -10 } });

  // Resize with partial overrides
  const resized = resizeArtboard({ artboard: moved, size: { width: 500 } });
  if (resized.success) {
    // Snap to an 8px grid
    const snapped = snapArtboardToGrid({ artboard: resized.artboard, gridSize: 8, mode: 'round' });
  }
} else {
  console.error(result.reason); // 'too-small' | 'invalid-input'
}
```

## API

### `createArtboard(input: CreateArtboardInput): CreateArtboardResult`

Creates a normalized artboard from two canvas points (e.g. drag start/end).

| Input field | Type | Default | Notes |
|---|---|---|---|
| `startPoint` | `Point` | required | Where the drag started |
| `endPoint` | `Point` | required | Where the drag ended |
| `name` | `string` | `"Artboard"` | Display label |
| `id` | `string` | `crypto.randomUUID()` | Pass a fixed value in tests |
| `minSize` | `number` | `1` | Fails with `'too-small'` if either dimension is below this |

Returns `{ success: true, artboard }` or `{ success: false, reason: 'too-small' | 'invalid-input' }`.

### `resizeArtboard(input: ResizeArtboardInput): CreateArtboardResult`

Applies partial overrides to `origin` and/or `size` — only the axes/dimensions you pass change. Respects `minSize` (default `1`). Never mutates the input.

```ts
resizeArtboard({ artboard, origin: { x: 0 }, size: { height: 900 } });
```

### `moveArtboard(input: MoveArtboardInput): Artboard`

Translates the artboard by `delta` (negative = left/up). Infallible — always returns a new artboard.

### `snapArtboardToGrid(input: SnapArtboardInput): Artboard`

Aligns origin and size to a grid.

| Input field | Type | Default | Notes |
|---|---|---|---|
| `gridSize` | `number` | `8` | Non-positive values are a no-op |
| `mode` | `'round' \| 'floor' \| 'ceil'` | `'round'` | How to pick the nearest grid line |

### `artboardToRect(artboard): { x, y, width, height }` / `artboardFromRect(rect, …)`

Convert between an `Artboard` and a plain rect object — handy at the boundary with rendering code.

### `artboardContainsPoint(artboard, point): boolean`

True if `point` lies inside the artboard (inclusive of edges).

### `artboardsOverlap(a, b): boolean`

True if two artboards intersect.

## Types

### `Artboard`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID v4 |
| `name` | `string` | Display label |
| `origin` | `Point` | Top-left corner — always the geometric minimum |
| `size` | `Size` | Always positive (normalized at creation) |
| `startPoint` / `endPoint` | `Point` | Raw drag points as passed by the caller |
| `createdAt` | `number` | Unix timestamp (ms) |

`Point` is `{ x: number; y: number }` (origin top-left, y grows downward); `Size` is `{ width: number; height: number }`.

### Zod schemas

`CreateArtboardInputSchema` and `ArtboardSchema` are exported for runtime validation of untrusted input:

```ts
import { ArtboardSchema } from '@komeilm76/km-artboard';

const parsed = ArtboardSchema.safeParse(jsonFromDisk);
if (parsed.success) { /* parsed.data is a valid Artboard */ }
```

## Guarantees

- **Pure** — inputs are never mutated; every operation returns new objects.
- **Never throws** — fallible operations return discriminated unions; check `success`.
- **Normalized** — `origin` is always top-left and `size` always positive, no matter which direction the user dragged.
- **Node 18 compatible** — UUID generation falls back to an RFC 4122 implementation when `crypto.randomUUID` is unavailable.

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `artboard` namespace |
| [`@komeilm76/km-exports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-exports) | Export artboard content to SVG / GeoJSON / PDF meta / raster plans |
| [`@komeilm76/km-imports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-imports) | Re-import artboard snapshots |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-artboard/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
