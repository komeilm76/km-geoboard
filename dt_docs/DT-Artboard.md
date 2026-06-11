# DT-Artboard

> Artboard geometry — pure functions, no DOM, no events, no UI.

---

## Overview

An **artboard** is a named rectangular region defined by two points on a canvas coordinate system.  
This module provides pure functions that compute artboard geometry from raw coordinate input and return structured, validated data objects.

There is no canvas, no mouse, no event listener in this module.  
The caller is responsible for collecting input coordinates from any source (pointer events, touch, keyboard, programmatic) and passing them to these functions.

---

## Coordinate System

All coordinates use a standard 2D canvas system:

- Origin `(0, 0)` is at the **top-left**.
- `x` increases to the right.
- `y` increases downward.
- All values are **floating-point numbers**.

---

## Core Concept: Artboard from Two Points

An artboard is defined by a **start point** (where the drag began) and an **end point** (where the pointer was released).  
The function normalizes these two points so that the result always has a positive width and height, regardless of drag direction.

```
Start ─────────────────┐
      │                │
      │   Artboard     │
      │                │
      └─────────────── End
```

All four drag directions are supported:

```
top-left → bottom-right   (normal)
top-right → bottom-left   (mirrored x)
bottom-left → top-right   (mirrored y)
bottom-right → top-left   (mirrored x + y)
```

---

## Types

### `Point`

```ts
type Point = {
  x: number;
  y: number;
};
```

### `Size`

```ts
type Size = {
  width: number;
  height: number;
};
```

### `Artboard`

```ts
type Artboard = {
  /** Unique identifier for this artboard */
  id: string;

  /** Human-readable label */
  name: string;

  /** Top-left corner of the artboard (always normalized) */
  origin: Point;

  /** Width and height in canvas units */
  size: Size;

  /** The raw start point passed by the caller */
  startPoint: Point;

  /** The raw end point passed by the caller */
  endPoint: Point;

  /** Unix timestamp (ms) when the artboard was created */
  createdAt: number;
};
```

### `CreateArtboardInput`

```ts
type CreateArtboardInput = {
  /** Where the drag started */
  startPoint: Point;

  /** Where the drag ended (pointer up) */
  endPoint: Point;

  /**
   * Optional name for the artboard.
   * @default "Artboard"
   */
  name?: string;

  /**
   * Optional explicit ID. If omitted, a UUID v4 is generated.
   * @default crypto.randomUUID()
   */
  id?: string;

  /**
   * Minimum allowed dimension (width or height) in canvas units.
   * If the resulting size is smaller than this in either axis, the function returns null.
   * @default 1
   */
  minSize?: number;
};
```

### `CreateArtboardResult`

```ts
type CreateArtboardResult =
  | { success: true; artboard: Artboard }
  | { success: false; reason: "too-small" | "invalid-input" };
```

---

## Functions

### `createArtboard`

Creates an artboard from two canvas points.

```ts
function createArtboard(input: CreateArtboardInput): CreateArtboardResult
```

**Behavior:**

1. Validates input (both points must be finite numbers).
2. Computes normalized `origin` as `{ x: min(x1, x2), y: min(y1, y2) }`.
3. Computes `size` as `{ width: abs(x2 - x1), height: abs(y2 - y1) }`.
4. If `width < minSize` or `height < minSize`, returns `{ success: false, reason: "too-small" }`.
5. Otherwise returns `{ success: true, artboard: Artboard }`.

**Example:**

```ts
const result = createArtboard({
  startPoint: { x: 100, y: 80 },
  endPoint:   { x: 400, y: 320 },
  name: "Frame 1",
});

// result.success === true
// result.artboard.origin  → { x: 100, y: 80 }
// result.artboard.size    → { width: 300, height: 240 }
```

**Drag from bottom-right to top-left:**

```ts
const result = createArtboard({
  startPoint: { x: 400, y: 320 },
  endPoint:   { x: 100, y: 80 },
});

// result.artboard.origin → { x: 100, y: 80 }  ← always normalized
// result.artboard.size   → { width: 300, height: 240 }
```

---

### `resizeArtboard`

Returns a new artboard with updated size and/or position.

```ts
type ResizeArtboardInput = {
  artboard: Artboard;
  origin?: Partial<Point>;
  size?: Partial<Size>;
  minSize?: number; // @default 1
};

function resizeArtboard(input: ResizeArtboardInput): CreateArtboardResult
```

---

### `moveArtboard`

Translates an artboard by a delta vector.

```ts
type MoveArtboardInput = {
  artboard: Artboard;
  delta: Point;
};

function moveArtboard(input: MoveArtboardInput): Artboard
```

---

### `artboardToRect`

Converts an artboard to a plain `[x, y, width, height]` tuple — useful for canvas `drawRect`, SVG `<rect>`, or bounding-box checks.

```ts
function artboardToRect(artboard: Artboard): [number, number, number, number]
```

---

### `artboardFromRect`

Reverse of `artboardToRect`. Creates an artboard from a rect tuple.

```ts
function artboardFromRect(
  rect: [number, number, number, number],
  options?: Pick<CreateArtboardInput, "name" | "id" | "minSize">
): CreateArtboardResult
```

---

### `artboardContainsPoint`

Returns `true` if a point is inside the artboard bounds (inclusive).

```ts
function artboardContainsPoint(artboard: Artboard, point: Point): boolean
```

---

### `artboardsOverlap`

Returns `true` if two artboards share any area.

```ts
function artboardsOverlap(a: Artboard, b: Artboard): boolean
```

---

### `snapArtboardToGrid`

Snaps the artboard origin and size to a grid cell size.

```ts
type SnapArtboardInput = {
  artboard: Artboard;
  /**
   * Grid cell size in canvas units.
   * @default 8
   */
  gridSize?: number;
  /**
   * Snap mode.
   * - "round"  → nearest grid line
   * - "floor"  → towards origin
   * - "ceil"   → away from origin
   * @default "round"
   */
  mode?: "round" | "floor" | "ceil";
};

function snapArtboardToGrid(input: SnapArtboardInput): Artboard
```

---

## Reverse Engineering / Serialization

Every `Artboard` object is plain JSON-serializable.  
To reconstruct an artboard from stored data, pass `startPoint` and `endPoint` back into `createArtboard`, or re-hydrate the `Artboard` object directly using the Zod schema (see **DT-Zod**).

The `id` and `createdAt` fields allow tracking artboard history and diffing across saves.

---

## Rules

- Functions are **pure**: same input always produces the same output.
- Functions never mutate their arguments.
- All dimension values are in abstract **canvas units** — there is no concept of pixels, em, or physical units here.
- Functions never throw; they return a result union instead.
- `id` generation uses `crypto.randomUUID()` which is available in Node 14.17+ and all modern browsers.

---

## File Location

```
packages/
  artboard/
    src/
      types.ts        ← Point, Size, Artboard, input/result types
      createArtboard.ts
      resizeArtboard.ts
      moveArtboard.ts
      artboardToRect.ts
      artboardContainsPoint.ts
      artboardsOverlap.ts
      snapArtboardToGrid.ts
      index.ts        ← re-exports all public API
    tests/
      createArtboard.test.ts
      resizeArtboard.test.ts
      ...
    help.md
```
