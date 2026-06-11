import type { MoveArtboardInput, Artboard } from './types';

/**
 * Translates an artboard by a delta vector, returning a new artboard.
 *
 * Only `origin` is updated — `startPoint`, `endPoint`, and all other fields
 * remain unchanged. The input artboard is never mutated. This function
 * cannot fail; any delta is valid.
 *
 * @param input - The artboard and the translation vector.
 * @returns A new `Artboard` with its `origin` shifted by `delta`.
 *
 * @example
 * const moved = moveArtboard({
 *   artboard,
 *   delta: { x: 50, y: -20 },  // move 50 right, 20 up
 * });
 * // moved.origin.x === artboard.origin.x + 50
 * // moved.origin.y === artboard.origin.y - 20
 */
export function moveArtboard(input: MoveArtboardInput): Artboard {
  const { artboard, delta } = input;

  return {
    ...artboard,
    origin: {
      x: artboard.origin.x + delta.x,
      y: artboard.origin.y + delta.y,
    },
  };
}
