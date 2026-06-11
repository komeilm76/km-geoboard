import type { Artboard, CreateArtboardInput, CreateArtboardResult } from './types';
import { createArtboard } from './createArtboard';

/**
 * Converts an artboard to a `[x, y, width, height]` tuple.
 *
 * Useful for canvas `drawRect`, SVG `<rect>`, or bounding-box checks.
 * This is the forward half of a round-trip pair with `artboardFromRect`.
 *
 * @param artboard - The artboard to convert.
 * @returns A `[x, y, width, height]` tuple.
 *
 * @example
 * const rect = artboardToRect(artboard);
 * // rect → [origin.x, origin.y, size.width, size.height]
 * ctx.fillRect(...rect);
 */
export function artboardToRect(artboard: Artboard): [number, number, number, number] {
  return [artboard.origin.x, artboard.origin.y, artboard.size.width, artboard.size.height];
}

/**
 * Creates an artboard from a `[x, y, width, height]` tuple.
 *
 * This is the reverse of `artboardToRect`. The round-trip contract holds:
 * `artboardToRect(artboardFromRect(rect).artboard!)` produces an equal tuple.
 *
 * @param rect    - A `[x, y, width, height]` tuple.
 * @param options - Optional name, id, and minSize passed to `createArtboard`.
 * @returns A `CreateArtboardResult` — check `success` before using `artboard`.
 *
 * @example
 * const result = artboardFromRect([100, 80, 300, 240], { name: 'Frame 1' });
 * // Equivalent to:
 * // createArtboard({ startPoint: { x: 100, y: 80 }, endPoint: { x: 400, y: 320 } })
 *
 * @example
 * // Round-trip
 * const rect: [number, number, number, number] = [10, 20, 300, 200];
 * const result = artboardFromRect(rect);
 * if (result.success) {
 *   const back = artboardToRect(result.artboard);
 *   // back deepEquals rect
 * }
 */
export function artboardFromRect(
  rect: [number, number, number, number],
  options?: Pick<CreateArtboardInput, 'name' | 'id' | 'minSize'>,
): CreateArtboardResult {
  const [x, y, w, h] = rect;
  return createArtboard({
    startPoint: { x, y },
    endPoint: { x: x + w, y: y + h },
    ...options,
  });
}
