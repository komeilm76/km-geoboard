import type { Artboard } from './types';

/**
 * Returns `true` if two artboards share any area, including touching edges.
 *
 * Two artboards "overlap" when they are not fully separated on either axis.
 * Touching edges (right edge of A === left edge of B) counts as overlap.
 *
 * @param a - First artboard.
 * @param b - Second artboard.
 * @returns `true` when the artboards share area or touch; `false` when separated.
 *
 * @example
 * artboardsOverlap(a, b)
 * // → true  when they share area
 * // → true  when they only touch at an edge
 * // → false when fully separated
 */
export function artboardsOverlap(a: Artboard, b: Artboard): boolean {
  const noOverlap =
    a.origin.x + a.size.width < b.origin.x ||
    b.origin.x + b.size.width < a.origin.x ||
    a.origin.y + a.size.height < b.origin.y ||
    b.origin.y + b.size.height < a.origin.y;

  return !noOverlap;
}
