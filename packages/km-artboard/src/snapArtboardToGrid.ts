import type { SnapArtboardInput, Artboard } from './types';

/**
 * Snaps an artboard's `origin` and `size` to the nearest grid line.
 *
 * This is a pure layout operation — the result may produce a zero-size
 * artboard if the artboard is very small and `"floor"` mode is used.
 * If you need to guard against that, call `resizeArtboard` afterward.
 *
 * The input artboard is never mutated. Non-geometry fields (`id`, `name`,
 * `createdAt`, `startPoint`, `endPoint`) are preserved unchanged.
 *
 * @param input - The artboard to snap, plus optional `gridSize` and `mode`.
 * @returns A new `Artboard` with snapped `origin` and `size`.
 *   If `gridSize <= 0`, the artboard is returned unchanged (no-op).
 *
 * @example
 * // "round" mode (default) — snap to nearest grid line
 * snapArtboardToGrid({ artboard, gridSize: 8 })
 * // origin.x = 7  →  8   (rounds up to nearest 8)
 * // size.width = 13  →  16  (rounds up)
 *
 * @example
 * // "floor" mode — always snap towards smaller values
 * snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' })
 * // origin.x = 7  →  0
 * // size.width = 13  →  8
 *
 * @example
 * // "ceil" mode — always snap towards larger values
 * snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' })
 * // origin.x = 1  →  8
 * // size.width = 9  →  16
 */
export function snapArtboardToGrid(input: SnapArtboardInput): Artboard {
  const { artboard, gridSize = 8, mode = 'round' } = input;

  // Defensive guard: non-positive grid sizes are a no-op
  if (gridSize <= 0) {
    return artboard;
  }

  function snap(value: number): number {
    let snapped: number;
    switch (mode) {
      case 'floor':
        snapped = Math.floor(value / gridSize) * gridSize;
        break;
      case 'ceil':
        snapped = Math.ceil(value / gridSize) * gridSize;
        break;
      default:
        snapped = Math.round(value / gridSize) * gridSize;
    }
    // Normalize -0 to +0 — -0 fails Object.is comparisons and serializes
    // inconsistently (e.g. JSON.stringify(-0) === "0" but String(-0) === "0"
    // while Object.is distinguishes them). See .planning/archives/sprint-1/project-evaluation 02 §B.
    return snapped === 0 ? 0 : snapped;
  }

  return {
    ...artboard,
    origin: {
      x: snap(artboard.origin.x),
      y: snap(artboard.origin.y),
    },
    size: {
      width: snap(artboard.size.width),
      height: snap(artboard.size.height),
    },
  };
}
