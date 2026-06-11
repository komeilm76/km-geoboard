import type { ResizeArtboardInput, CreateArtboardResult } from './types';

/**
 * Returns a new artboard with updated origin and/or size.
 *
 * Only the fields provided in `origin` and `size` are changed; omitted
 * axes keep their original values. The input artboard is never mutated.
 *
 * @param input - The artboard to resize plus partial overrides.
 * @returns A `CreateArtboardResult` union:
 *   - `{ success: true, artboard }` when the result meets the `minSize` constraint.
 *   - `{ success: false, reason: "too-small" }` when either dimension < `minSize`.
 *
 * @example
 * const result = resizeArtboard({
 *   artboard,
 *   size: { width: 500 },   // only width changes; height stays the same
 *   minSize: 10,
 * });
 */
export function resizeArtboard(input: ResizeArtboardInput): CreateArtboardResult {
  const { artboard, origin: originOverride, size: sizeOverride, minSize = 1 } = input;

  const origin = { ...artboard.origin, ...originOverride };
  const size = { ...artboard.size, ...sizeOverride };

  if (size.width < minSize || size.height < minSize) {
    return { success: false, reason: 'too-small' };
  }

  return {
    success: true,
    artboard: { ...artboard, origin, size },
  };
}
