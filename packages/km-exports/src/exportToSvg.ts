/**
 * @file exportToSvg.ts
 * Serializes artboard content to an SVG XML string.
 */

import type {
  Result,
  SvgExportOptions,
  SvgElement,
  SvgGroupElement,
  SvgColor,
  SvgTransform,
  SvgLength,
} from './types';
import { applyExportFilter } from './filter';

// ─── Color serialization ──────────────────────────────────────────────────────

function serializeColor(color: SvgColor): string {
  switch (color.type) {
    case 'none':  return 'none';
    case 'hex':   return color.value;
    case 'named': return color.value;
    case 'rgb':   return `rgb(${color.r}, ${color.g}, ${color.b})`;
    case 'rgba':  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }
}

// ─── Length serialization ─────────────────────────────────────────────────────

function serializeLength(len: SvgLength): string {
  return `${len.value}${len.unit}`;
}

// ─── Transform serialization ──────────────────────────────────────────────────

function serializeTransform(transform: SvgTransform): string {
  return transform.map((op) => {
    switch (op.type) {
      case 'translate': return `translate(${op.tx}, ${op.ty})`;
      case 'scale':     return `scale(${op.sx}, ${op.sy})`;
      case 'rotate':
        return op.cx !== undefined && op.cy !== undefined
          ? `rotate(${op.angle}, ${op.cx}, ${op.cy})`
          : `rotate(${op.angle})`;
      case 'skewX':  return `skewX(${op.angle})`;
      case 'skewY':  return `skewY(${op.angle})`;
      case 'matrix': return `matrix(${op.a} ${op.b} ${op.c} ${op.d} ${op.e} ${op.f})`;
    }
  }).join(' ');
}

// ─── Presentation-attribute serialization ────────────────────────────────────

/** Build an attribute string fragment from presentation + core attributes. */
function baseAttrs(el: SvgElement): string {
  const parts: string[] = [];

  if (el.id)        parts.push(`id="${el.id}"`);
  if (el.className) parts.push(`class="${el.className}"`);
  if (el.style)     parts.push(`style="${el.style}"`);
  if (el.transform && el.transform.length > 0) {
    parts.push(`transform="${serializeTransform(el.transform)}"`);
  }

  // Presentation attributes
  if (el.fill !== undefined)          parts.push(`fill="${serializeColor(el.fill)}"`);
  if (el.fillOpacity !== undefined)   parts.push(`fill-opacity="${el.fillOpacity}"`);
  if (el.fillRule !== undefined)      parts.push(`fill-rule="${el.fillRule}"`);
  if (el.stroke !== undefined)        parts.push(`stroke="${serializeColor(el.stroke)}"`);
  if (el.strokeWidth !== undefined)   parts.push(`stroke-width="${serializeLength(el.strokeWidth)}"`);
  if (el.strokeOpacity !== undefined) parts.push(`stroke-opacity="${el.strokeOpacity}"`);
  if (el.strokeLinecap !== undefined) parts.push(`stroke-linecap="${el.strokeLinecap}"`);
  if (el.strokeLinejoin !== undefined)parts.push(`stroke-linejoin="${el.strokeLinejoin}"`);
  if (el.strokeDasharray !== undefined && el.strokeDasharray.length > 0) {
    parts.push(`stroke-dasharray="${el.strokeDasharray.join(' ')}"`);
  }
  if (el.strokeDashoffset !== undefined) parts.push(`stroke-dashoffset="${el.strokeDashoffset}"`);
  if (el.strokeMiterlimit !== undefined) parts.push(`stroke-miterlimit="${el.strokeMiterlimit}"`);
  if (el.opacity !== undefined)       parts.push(`opacity="${el.opacity}"`);
  if (el.display !== undefined)       parts.push(`display="${el.display}"`);
  if (el.visibility !== undefined)    parts.push(`visibility="${el.visibility}"`);
  if (el.clipPath !== undefined)      parts.push(`clip-path="${el.clipPath}"`);
  if (el.clipRule !== undefined)      parts.push(`clip-rule="${el.clipRule}"`);
  if (el.mask !== undefined)          parts.push(`mask="${el.mask}"`);
  if (el.filter !== undefined)        parts.push(`filter="${el.filter}"`);
  if (el.pointerEvents !== undefined) parts.push(`pointer-events="${el.pointerEvents}"`);

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

/** Serialize polyline/polygon points array to `"x1,y1 x2,y2 ..."`. */
function serializePoints(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

// ─── Element serialization ────────────────────────────────────────────────────

/**
 * Recursively serialize an SVG element to its XML string representation.
 *
 * @param el    - The element to serialize.
 * @param depth - Current nesting depth (used for pretty-printing).
 * @param pretty- Whether to apply 2-space indentation.
 * @returns XML string for this element and its children.
 */
function serializeElement(el: SvgElement, depth: number, pretty: boolean): string {
  const indent  = pretty ? '  '.repeat(depth) : '';
  const newline = pretty ? '\n' : '';
  const attrs   = baseAttrs(el);

  switch (el.type) {
    case 'path':
      return `${indent}<path d="${el.d}"${attrs}/>`;

    case 'rect': {
      let tag = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`;
      if (el.rx !== undefined) tag += ` rx="${el.rx}"`;
      if (el.ry !== undefined) tag += ` ry="${el.ry}"`;
      tag += `${attrs}/>`;
      return `${indent}${tag}`;
    }

    case 'circle':
      return `${indent}<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"${attrs}/>`;

    case 'ellipse':
      return `${indent}<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}"${attrs}/>`;

    case 'line':
      return `${indent}<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"${attrs}/>`;

    case 'polyline':
      return `${indent}<polyline points="${serializePoints(el.points)}"${attrs}/>`;

    case 'polygon':
      return `${indent}<polygon points="${serializePoints(el.points)}"${attrs}/>`;

    case 'text': {
      let tag = `<text x="${el.x}" y="${el.y}"`;
      if (el.fontSize   !== undefined) tag += ` font-size="${serializeLength(el.fontSize)}"`;
      if (el.fontFamily !== undefined) tag += ` font-family="${el.fontFamily}"`;
      if (el.fontWeight !== undefined) tag += ` font-weight="${el.fontWeight}"`;
      if (el.textAnchor !== undefined) tag += ` text-anchor="${el.textAnchor}"`;
      tag += `${attrs}>${el.content}</text>`;
      return `${indent}${tag}`;
    }

    case 'g': {
      const group = el as SvgGroupElement;
      const childLines = group.children.map((child) =>
        serializeElement(child, depth + 1, pretty),
      );
      const inner = childLines.join(newline);
      if (pretty) {
        return `${indent}<g${attrs}>\n${inner}\n${indent}</g>`;
      }
      return `${indent}<g${attrs}>${inner}</g>`;
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Serializes artboard content and SVG elements into an SVG XML string.
 *
 * @param options - SVG export options.
 * @returns `Result<string>` — the SVG string on success, or an error.
 *
 * @example
 * const result = exportToSvg({ artboard, elements, xmlDeclaration: true, pretty: true });
 * if (result.success) fs.writeFileSync('output.svg', result.data);
 */
export function exportToSvg(options: SvgExportOptions): Result<string> {
  const {
    artboard,
    elements,
    filter,
    inlineAssets = false,  // eslint-disable-line @typescript-eslint/no-unused-vars
    xmlDeclaration = true,
    pretty = false,
  } = options;

  // Apply filter
  const filtered = applyExportFilter(elements, filter);
  if (filtered.length === 0) {
    return {
      success: false,
      error: { code: 'empty-export', message: 'No elements remain after applying the export filter.' },
    };
  }

  const newline = pretty ? '\n' : '';

  // Build SVG opening tag
  const { origin, size } = artboard;
  const viewBox = `${origin.x} ${origin.y} ${size.width} ${size.height}`;
  let svgTag = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size.width}" height="${size.height}">`;

  // Serialize elements
  const elementLines = filtered.map((el) => serializeElement(el, 1, pretty));
  const body = elementLines.join(newline);

  let svg: string;
  if (pretty) {
    svg = `${svgTag}\n${body}\n</svg>`;
  } else {
    svg = `${svgTag}${body}</svg>`;
  }

  // Prepend XML declaration
  if (xmlDeclaration) {
    svg = `<?xml version="1.0" encoding="UTF-8"?>${newline}${svg}`;
  }

  return { success: true, data: svg };
}
