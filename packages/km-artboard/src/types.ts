/**
 * Core TypeScript types for the artboard domain.
 *
 * This file contains ONLY type definitions — no Zod imports, no runtime code.
 * Zod schemas live in `schemas.ts`. This separation ensures declaration files
 * never carry a Zod import (see zod_hang.md).
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

/**
 * A 2D point in canvas coordinate space.
 * Origin (0, 0) is at the top-left; x increases right, y increases down.
 */
export type Point = {
  /** Horizontal position in canvas units. */
  x: number;
  /** Vertical position in canvas units. */
  y: number;
};

/**
 * A 2D size in canvas coordinate space.
 */
export type Size = {
  /** Horizontal extent in canvas units. */
  width: number;
  /** Vertical extent in canvas units. */
  height: number;
};

// ─── Artboard ─────────────────────────────────────────────────────────────────

/**
 * A named rectangular region defined by two points on a canvas.
 * The geometry is always normalized: `origin` is the top-left corner and
 * `size` values are always positive, regardless of drag direction.
 */
export type Artboard = {
  /** Unique identifier for this artboard (UUID v4). */
  id: string;

  /** Human-readable label shown in the UI. */
  name: string;

  /**
   * Top-left corner of the artboard in canvas coordinates.
   * Always the geometric minimum of `startPoint` and `endPoint`.
   */
  origin: Point;

  /**
   * Width and height of the artboard in canvas units.
   * Always positive — normalization is applied during creation.
   */
  size: Size;

  /**
   * The raw point where the drag began, as passed by the caller.
   * May be any corner of the resulting rectangle.
   */
  startPoint: Point;

  /**
   * The raw point where the drag ended (pointer up), as passed by the caller.
   * May be any corner of the resulting rectangle.
   */
  endPoint: Point;

  /**
   * Unix timestamp (milliseconds since epoch) when this artboard was created.
   * Use `Date.now()` to produce this value.
   */
  createdAt: number;
};

// ─── Input types ──────────────────────────────────────────────────────────────

/**
 * Input to `createArtboard` — the two canvas points that define the region.
 */
export type CreateArtboardInput = {
  /** Where the drag started on the canvas. */
  startPoint: Point;

  /** Where the drag ended (pointer up) on the canvas. */
  endPoint: Point;

  /**
   * Human-readable label for the artboard.
   * @default "Artboard"
   */
  name?: string;

  /**
   * Explicit ID to assign. A UUID v4 is generated when omitted.
   * Pass a fixed value in tests for deterministic output.
   * @default crypto.randomUUID()
   */
  id?: string;

  /**
   * Minimum allowed width or height in canvas units.
   * If either dimension is smaller than this, creation fails with `"too-small"`.
   * @default 1
   */
  minSize?: number;
};

/**
 * Result of `createArtboard` and `resizeArtboard`.
 * A discriminated union — check `success` before accessing `artboard`.
 */
export type CreateArtboardResult =
  | { success: true; artboard: Artboard }
  | { success: false; reason: 'too-small' | 'invalid-input' };

/**
 * Input to `resizeArtboard` — partial overrides for origin and/or size.
 */
export type ResizeArtboardInput = {
  /** The artboard to resize. Never mutated. */
  artboard: Artboard;

  /**
   * Partial override for `origin`. Only provided axes are changed.
   */
  origin?: Partial<Point>;

  /**
   * Partial override for `size`. Only provided dimensions are changed.
   */
  size?: Partial<Size>;

  /**
   * Minimum allowed width or height in canvas units after resize.
   * @default 1
   */
  minSize?: number;
};

/**
 * Input to `moveArtboard` — translates the artboard by a delta vector.
 */
export type MoveArtboardInput = {
  /** The artboard to move. Never mutated. */
  artboard: Artboard;

  /**
   * Translation vector applied to `origin`.
   * Negative values move left / up; positive values move right / down.
   */
  delta: Point;
};

/**
 * Input to `snapArtboardToGrid` — aligns geometry to a grid.
 */
export type SnapArtboardInput = {
  /** The artboard to snap. Never mutated. */
  artboard: Artboard;

  /**
   * Grid cell size in canvas units. Must be > 0; non-positive values are
   * treated as a no-op (artboard is returned unchanged).
   * @default 8
   */
  gridSize?: number;

  /**
   * How to snap to the nearest grid line.
   * - `"round"` — nearest grid line (default)
   * - `"floor"` — towards the origin (always smaller or equal)
   * - `"ceil"`  — away from the origin (always larger or equal)
   * @default "round"
   */
  mode?: 'round' | 'floor' | 'ceil';
};
