/**
 * km-artboard — Pure artboard geometry functions for 2D canvas applications.
 *
 * All functions are pure: they never mutate inputs, never throw, and return
 * discriminated unions for fallible operations.
 *
 * @packageDocumentation
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  Point,
  Size,
  Artboard,
  CreateArtboardInput,
  CreateArtboardResult,
  ResizeArtboardInput,
  MoveArtboardInput,
  SnapArtboardInput,
} from './types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
export { CreateArtboardInputSchema, ArtboardSchema } from './schemas';

// ─── Functions ────────────────────────────────────────────────────────────────
export { createArtboard } from './createArtboard';
export { resizeArtboard } from './resizeArtboard';
export { moveArtboard } from './moveArtboard';
export { artboardToRect, artboardFromRect } from './artboardToRect';
export { artboardContainsPoint } from './artboardContainsPoint';
export { artboardsOverlap } from './artboardsOverlap';
export { snapArtboardToGrid } from './snapArtboardToGrid';
