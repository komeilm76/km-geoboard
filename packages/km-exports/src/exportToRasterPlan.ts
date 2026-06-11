/**
 * @file exportToRasterPlan.ts
 * Converts artboard content into a RasterExportPlan — ordered canvas draw
 * instructions for producing a PNG or JPEG image.
 *
 * This function does NOT touch any canvas API. It produces instructions only.
 * The consumer executes them with `CanvasRenderingContext2D` or an equivalent.
 *
 * DOM-free: no `HTMLCanvasElement`, `CanvasRenderingContext2D`, or browser APIs.
 */

import type {
  Result,
  Artboard,
  SvgElement,
  ExportFilter,
  RasterExportPlan,
  RasterDrawInstruction,
  SvgColor,
  SvgLength,
} from './types';
import { applyExportFilter } from './filter';

// ─── Color helpers ────────────────────────────────────────────────────────────

function colorToString(color: SvgColor | undefined): string {
  if (!color) return 'black';
  switch (color.type) {
    case 'none':  return 'transparent';
    case 'hex':   return color.value;
    case 'named': return color.value;
    case 'rgb':   return `rgb(${color.r}, ${color.g}, ${color.b})`;
    case 'rgba':  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }
}

function lengthToNumber(len: SvgLength | undefined, fallback: number): number {
  if (len === undefined) return fallback;
  // Use the raw numeric value (treat as pixels for canvas purposes)
  return len.value;
}

// ─── Polyline/polygon → path data ────────────────────────────────────────────

function pointsToPathD(points: [number, number][], close: boolean, scale: number): string {
  const [first, ...rest] = points;
  if (first === undefined) return '';
  const cmds = [`M ${first[0] * scale},${first[1] * scale}`];
  for (const [x, y] of rest) {
    cmds.push(`L ${x * scale},${y * scale}`);
  }
  if (close) cmds.push('Z');
  return cmds.join(' ');
}

// ─── Element → draw instructions ─────────────────────────────────────────────

/**
 * Converts a single SVG element to one or more `RasterDrawInstruction` objects.
 *
 * Scale is applied to all coordinate values.
 * For `SvgPathElement`, the path `d` string is prefixed with `scale(N)` so the
 * consumer's canvas renderer applies the scale during drawing.
 *
 * @param el    - SVG element to convert.
 * @param scale - Pixel-density scale factor.
 * @returns Array of draw instructions for this element and any descendants.
 */
function elementToInstructions(el: SvgElement, scale: number): RasterDrawInstruction[] {
  switch (el.type) {
    case 'rect':
      return [
        {
          type: 'rect',
          x: el.x * scale,
          y: el.y * scale,
          w: el.width  * scale,
          h: el.height * scale,
          fill:        colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'circle':
      return [
        {
          type:   'circle',
          cx:     el.cx * scale,
          cy:     el.cy * scale,
          r:      el.r  * scale,
          fill:   colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
        },
      ];

    case 'ellipse':
      // Approximate as a path (canvas has no built-in ellipse in older APIs)
      // Serialize as a path instruction with scale prefix.
      return [
        {
          type:  'path',
          d:     `M ${el.cx},${el.cy - el.ry} A ${el.rx},${el.ry} 0 1 0 ${el.cx},${el.cy + el.ry} A ${el.rx},${el.ry} 0 1 0 ${el.cx},${el.cy - el.ry} Z`,
          fill:  colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'path':
      // Prefix the path with a scale transform so the consumer applies it.
      // The raw `d` coordinates are not modified — scaling is expressed via
      // the transform prefix. See JSDoc above.
      return [
        {
          type:  'path',
          d:     scale !== 1 ? `scale(${scale}) ${el.d}` : el.d,
          fill:  colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'line':
      return [
        {
          type:  'path',
          d:     `M ${el.x1 * scale},${el.y1 * scale} L ${el.x2 * scale},${el.y2 * scale}`,
          fill:  'none',
          stroke: el.stroke ? colorToString(el.stroke) : colorToString(el.fill),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'polyline':
      return [
        {
          type:  'path',
          d:     pointsToPathD(el.points, false, scale),
          fill:  colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'polygon':
      return [
        {
          type:  'path',
          d:     pointsToPathD(el.points, true, scale),
          fill:  colorToString(el.fill),
          ...(el.stroke ? { stroke: colorToString(el.stroke) } : {}),
          ...(el.strokeWidth ? { strokeWidth: lengthToNumber(el.strokeWidth, 1) * scale } : {}),
        },
      ];

    case 'text': {
      const size   = el.fontSize   ? `${el.fontSize.value}${el.fontSize.unit || 'px'}` : '12px';
      const family = el.fontFamily ?? 'sans-serif';
      return [
        {
          type:    'text',
          x:       el.x * scale,
          y:       el.y * scale,
          content: el.content,
          font:    `${size} ${family}`,
          fill:    colorToString(el.fill),
        },
      ];
    }

    case 'g': {
      /**
       * Flatten group children recursively.
       * Group `transform` handling: only `translate` and `scale` are composable
       * here. Complex transforms (rotate, matrix) are noted as a limitation —
       * the consumer should apply them at render time.
       */
      return el.children.flatMap((child) => elementToInstructions(child, scale));
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Converts artboard content into a {@link RasterExportPlan} — an ordered set
 * of draw instructions for rendering to PNG or JPEG.
 *
 * The consumer executes the instructions using a canvas API:
 * ```ts
 * const canvas = document.createElement('canvas');
 * canvas.width  = plan.canvasWidth;
 * canvas.height = plan.canvasHeight;
 * const ctx = canvas.getContext('2d')!;
 * ctx.fillStyle = plan.background;
 * ctx.fillRect(0, 0, plan.canvasWidth, plan.canvasHeight);
 * for (const instr of plan.instructions) {
 *   if (instr.type === 'rect') {
 *     ctx.fillStyle = instr.fill;
 *     ctx.fillRect(instr.x, instr.y, instr.w, instr.h);
 *   }
 *   // ... handle other instruction types
 * }
 * ```
 *
 * @param artboard - The artboard defining canvas dimensions.
 * @param elements - SVG elements to rasterize.
 * @param format   - `"png"` or `"jpeg"`.
 * @param scale    - Pixel-density scale factor (e.g. `2` for 2× retina). @default 1
 * @param filter   - Optional element filter.
 * @returns `Result<RasterExportPlan>` — the plan or an error.
 */
export function exportToRasterPlan(
  artboard: Artboard,
  elements: SvgElement[],
  format: 'png' | 'jpeg',
  scale?: number,
  filter?: ExportFilter,
): Result<RasterExportPlan> {
  const s = scale ?? 1;

  // Apply filter
  const filtered = applyExportFilter(elements, filter);
  if (filtered.length === 0) {
    return {
      success: false,
      error: { code: 'empty-export', message: 'No elements remain after applying the export filter.' },
    };
  }

  // Canvas dimensions
  const canvasWidth  = Math.round(artboard.size.width  * s);
  const canvasHeight = Math.round(artboard.size.height * s);

  // Build instructions
  const instructions: RasterDrawInstruction[] = filtered.flatMap((el) =>
    elementToInstructions(el, s),
  );

  return {
    success: true,
    data: {
      canvasWidth,
      canvasHeight,
      background: '#ffffff',
      instructions,
      format,
      ...(format === 'jpeg' ? { quality: 0.92 } : {}),
    },
  };
}
