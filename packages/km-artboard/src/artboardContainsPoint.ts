import type { Artboard, Point } from './types';

/**
 * Returns `true` if a point lies within the artboard bounds (inclusive on all edges).
 *
 * A point exactly on any edge is considered inside the artboard.
 *
 * @param artboard - The artboard to test against.
 * @param point    - The canvas point to test.
 * @returns `true` when the point is inside or on the boundary; `false` otherwise.
 *
 * @example
 * artboardContainsPoint(artboard, { x: artboard.origin.x, y: artboard.origin.y })
 * // → true  (top-left corner is on the edge)
 *
 * artboardContainsPoint(artboard, { x: -1, y: -1 })
 * // → false (outside)
 */
export function artboardContainsPoint(artboard: Artboard, point: Point): boolean {
  const { origin, size } = artboard;
  return (
    point.x >= origin.x &&
    point.x <= origin.x + size.width &&
    point.y >= origin.y &&
    point.y <= origin.y + size.height
  );
}
