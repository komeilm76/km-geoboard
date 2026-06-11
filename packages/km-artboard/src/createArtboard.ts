import type { Artboard, CreateArtboardInput, CreateArtboardResult } from './types';
import { CreateArtboardInputSchema } from './schemas';

/**
 * Creates a normalized `Artboard` from two canvas points.
 *
 * The function accepts any drag direction — start and end points may be any
 * two corners of the resulting rectangle. The `origin` is always the
 * top-left corner and `size` values are always positive.
 *
 * @param input - The two drag points and optional metadata.
 * @returns A `CreateArtboardResult` discriminated union.
 *   - `{ success: true, artboard }` on success.
 *   - `{ success: false, reason: "invalid-input" }` if coordinates are non-finite.
 *   - `{ success: false, reason: "too-small" }` if either dimension < `minSize`.
 *
 * @example
 * // Normal drag — top-left to bottom-right
 * const result = createArtboard({
 *   startPoint: { x: 100, y: 80 },
 *   endPoint:   { x: 400, y: 320 },
 *   name: 'Frame 1',
 * });
 * // result.success === true
 * // result.artboard.origin → { x: 100, y: 80 }
 * // result.artboard.size   → { width: 300, height: 240 }
 *
 * @example
 * // Reverse drag — bottom-right to top-left (origin is normalized)
 * const result = createArtboard({
 *   startPoint: { x: 400, y: 320 },
 *   endPoint:   { x: 100, y: 80 },
 * });
 * // result.artboard.origin → { x: 100, y: 80 }  ← always top-left
 * // result.artboard.size   → { width: 300, height: 240 }
 */
export function createArtboard(input: CreateArtboardInput): CreateArtboardResult {
  const parsed = CreateArtboardInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, reason: 'invalid-input' };
  }

  const { startPoint, endPoint, name, id, minSize } = parsed.data;

  const origin = {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
  };

  const size = {
    width: Math.abs(endPoint.x - startPoint.x),
    height: Math.abs(endPoint.y - startPoint.y),
  };

  if (size.width < minSize || size.height < minSize) {
    return { success: false, reason: 'too-small' };
  }

  const artboard: Artboard = {
    id: id ?? crypto.randomUUID(),
    name,
    origin,
    size,
    startPoint,
    endPoint,
    createdAt: Date.now(),
  };

  return { success: true, artboard };
}
