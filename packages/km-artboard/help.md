# km-artboard API Reference

## Overview

`km-artboard` provides pure geometry functions for creating and manipulating rectangular regions (artboards) on a 2D canvas coordinate system. All functions are pure — they never mutate inputs, never throw, and return discriminated unions for fallible operations.

**Coordinate system:** Origin `(0, 0)` is at the top-left. `x` increases right, `y` increases down.

---

## Installation

```bash
npm install @komeilm76/km-artboard
```

Zod must be available as a peer dependency:

```bash
npm install zod
```

---

## Functions

### `createArtboard`

Creates a normalized `Artboard` from two canvas points (e.g. drag start/end).

**Input**

| Field | Type | Required | Default |
|---|---|---|---|
| `startPoint` | `Point` | ✓ | — |
| `endPoint` | `Point` | ✓ | — |
| `name` | `string` | | `"Artboard"` |
| `id` | `string` (UUID) | | `crypto.randomUUID()` |
| `minSize` | `number` | | `1` |

**Output:** `CreateArtboardResult`

```ts
import { createArtboard } from '@komeilm76/km-artboard';

const result = createArtboard({
  startPoint: { x: 100, y: 80 },
  endPoint:   { x: 400, y: 320 },
  name: 'Frame 1',
});

if (result.success) {
  console.log(result.artboard.origin); // { x: 100, y: 80 }
  console.log(result.artboard.size);   // { width: 300, height: 240 }
} else {
  console.log(result.reason); // "too-small" | "invalid-input"
}
```

Supports all four drag directions — origin is always normalized to top-left:

```ts
// Bottom-right → top-left drag
const result = createArtboard({
  startPoint: { x: 400, y: 320 },
  endPoint:   { x: 100, y: 80 },
});
// result.artboard.origin → { x: 100, y: 80 }  (normalized)
```

---

### `resizeArtboard`

Returns a new artboard with partially updated origin and/or size.

**Input**

| Field | Type | Required | Default |
|---|---|---|---|
| `artboard` | `Artboard` | ✓ | — |
| `origin` | `Partial<Point>` | | unchanged |
| `size` | `Partial<Size>` | | unchanged |
| `minSize` | `number` | | `1` |

**Output:** `CreateArtboardResult`

```ts
import { resizeArtboard } from '@komeilm76/km-artboard';

const result = resizeArtboard({
  artboard,
  size: { width: 500 },  // only width changes; height stays the same
});
```

---

### `moveArtboard`

Translates an artboard by a delta vector. Returns a new artboard — cannot fail.

**Input**

| Field | Type | Required |
|---|---|---|
| `artboard` | `Artboard` | ✓ |
| `delta` | `Point` | ✓ |

**Output:** `Artboard`

```ts
import { moveArtboard } from '@komeilm76/km-artboard';

const moved = moveArtboard({
  artboard,
  delta: { x: 50, y: -20 },  // 50 right, 20 up
});
```

---

### `artboardToRect`

Converts an artboard to a `[x, y, width, height]` tuple.

**Input:** `Artboard`  
**Output:** `[number, number, number, number]`

```ts
import { artboardToRect } from '@komeilm76/km-artboard';

const [x, y, w, h] = artboardToRect(artboard);
ctx.fillRect(x, y, w, h);
```

---

### `artboardFromRect`

Reverse of `artboardToRect`. Creates an artboard from a rect tuple.

**Input:** `[x, y, width, height]` + optional `Pick<CreateArtboardInput, 'name' | 'id' | 'minSize'>`  
**Output:** `CreateArtboardResult`

```ts
import { artboardFromRect, artboardToRect } from '@komeilm76/km-artboard';

// Round-trip
const rect: [number, number, number, number] = [10, 20, 300, 200];
const result = artboardFromRect(rect);
if (result.success) {
  artboardToRect(result.artboard); // [10, 20, 300, 200]
}
```

---

### `artboardContainsPoint`

Returns `true` if a point is inside the artboard bounds (inclusive on all edges).

**Input:** `(artboard: Artboard, point: Point)`  
**Output:** `boolean`

```ts
import { artboardContainsPoint } from '@komeilm76/km-artboard';

artboardContainsPoint(artboard, { x: 150, y: 100 }); // true
artboardContainsPoint(artboard, { x: 0,   y: 0   }); // false (outside)

// Edge points are included
artboardContainsPoint(artboard, artboard.origin); // true
```

---

### `artboardsOverlap`

Returns `true` if two artboards share any area, including touching edges.

**Input:** `(a: Artboard, b: Artboard)`  
**Output:** `boolean`

```ts
import { artboardsOverlap } from '@komeilm76/km-artboard';

artboardsOverlap(a, b); // true if they share area or touch
// Touching edges count as overlap:
// a right-edge === b left-edge → true
```

---

### `snapArtboardToGrid`

Snaps `origin` and `size` to the nearest grid line. Never fails — returns artboard unchanged if `gridSize <= 0`.

**Input**

| Field | Type | Required | Default |
|---|---|---|---|
| `artboard` | `Artboard` | ✓ | — |
| `gridSize` | `number` | | `8` |
| `mode` | `"round" \| "floor" \| "ceil"` | | `"round"` |

**Output:** `Artboard`

| Mode | Behavior |
|---|---|
| `"round"` | Nearest grid line |
| `"floor"` | Always towards smaller values (towards origin) |
| `"ceil"` | Always towards larger values (away from origin) |

```ts
import { snapArtboardToGrid } from '@komeilm76/km-artboard';

// "round" — origin.x=7, gridSize=8 → 8
const snapped = snapArtboardToGrid({ artboard, gridSize: 8 });

// "floor" — origin.x=7, gridSize=8 → 0
const floored = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' });

// "ceil" — origin.x=1, gridSize=8 → 8
const ceiled = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' });
```

---

## Types

### `Artboard`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID v4 identifier |
| `name` | `string` | Human-readable label |
| `origin` | `Point` | Top-left corner (always normalized) |
| `size` | `Size` | Width and height (always positive) |
| `startPoint` | `Point` | Raw drag start point |
| `endPoint` | `Point` | Raw drag end point |
| `createdAt` | `number` | Unix timestamp in milliseconds |

### `Point`

| Field | Type |
|---|---|
| `x` | `number` |
| `y` | `number` |

### `Size`

| Field | Type |
|---|---|
| `width` | `number` |
| `height` | `number` |

---

## Errors

Fallible functions return `CreateArtboardResult` — never throw.

| `reason` | When |
|---|---|
| `"too-small"` | Either dimension < `minSize` |
| `"invalid-input"` | Non-finite coordinates (NaN, Infinity, -Infinity) |
