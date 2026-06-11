/**
 * parseSvgDocument — SVG XML string → SvgDocument
 *
 * Uses fast-xml-parser (pure JS, no DOM, works in Node and browser).
 */

import { XMLParser } from 'fast-xml-parser';
import type { Result } from '@komeilm76/km-shared';

import type {
  SvgDocument,
  SvgElement,
  SvgColor,
  SvgTransform,
  SvgTransformOperation,
  SvgLength,
  SvgLengthUnit,
  SvgViewBox,
  SvgPresentationAttributes,
  SvgCoreAttributes,
} from './types';

// ─── Color Parser ─────────────────────────────────────────────────────────────

export function parseColor(value: string): SvgColor {
  const v = value.trim();

  if (v === 'none' || v === '') return { type: 'none' };

  // hex
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) {
    return { type: 'hex', value: v };
  }

  // rgb(...)
  const rgbMatch = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(v);
  if (rgbMatch) {
    return {
      type: 'rgb',
      r: parseInt(rgbMatch[1]!, 10),
      g: parseInt(rgbMatch[2]!, 10),
      b: parseInt(rgbMatch[3]!, 10),
    };
  }

  // rgba(...)
  const rgbaMatch = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(v);
  if (rgbaMatch) {
    return {
      type: 'rgba',
      r: parseInt(rgbaMatch[1]!, 10),
      g: parseInt(rgbaMatch[2]!, 10),
      b: parseInt(rgbaMatch[3]!, 10),
      a: parseFloat(rgbaMatch[4]!),
    };
  }

  // named color
  return { type: 'named', value: v };
}

// ─── Length Parser ────────────────────────────────────────────────────────────

export function parseLength(value: string): SvgLength {
  const v = value.trim();
  const match = /^([\d.+-]+)(px|pt|pc|mm|cm|in|em|ex|rem|vw|vh|%)?$/.exec(v);
  if (match) {
    return {
      value: parseFloat(match[1]!),
      unit: (match[2] ?? '') as SvgLengthUnit,
    };
  }
  return { value: parseFloat(v) || 0, unit: '' };
}

// ─── ViewBox Parser ───────────────────────────────────────────────────────────

export function parseViewBox(value: string): SvgViewBox | undefined {
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length === 4 && parts.every(n => isFinite(n))) {
    return {
      minX:   parts[0]!,
      minY:   parts[1]!,
      width:  parts[2]!,
      height: parts[3]!,
    };
  }
  return undefined;
}

// ─── Transform Parser ─────────────────────────────────────────────────────────

export function parseTransform(value: string): SvgTransform {
  const ops: SvgTransform = [];
  // match each function call: name(args)
  const re = /(\w+)\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    const name = m[1]!.toLowerCase();
    const args = (m[2] ?? '').trim().split(/[\s,]+/).map(Number);

    switch (name) {
      case 'translate':
        ops.push({ type: 'translate', tx: args[0] ?? 0, ty: args[1] ?? 0 });
        break;
      case 'scale':
        ops.push({ type: 'scale', sx: args[0] ?? 1, sy: args[1] ?? (args[0] ?? 1) });
        break;
      case 'rotate':
        ops.push({
          type: 'rotate',
          angle: args[0] ?? 0,
          ...(args.length >= 3 ? { cx: args[1], cy: args[2] } : {}),
        } as SvgTransformOperation);
        break;
      case 'skewx':
        ops.push({ type: 'skewX', angle: args[0] ?? 0 });
        break;
      case 'skewy':
        ops.push({ type: 'skewY', angle: args[0] ?? 0 });
        break;
      case 'matrix':
        if (args.length === 6) {
          ops.push({
            type: 'matrix',
            a: args[0]!, b: args[1]!, c: args[2]!,
            d: args[3]!, e: args[4]!, f: args[5]!,
          });
        }
        break;
    }
  }
  return ops;
}

// ─── Points Parser ────────────────────────────────────────────────────────────

function parsePoints(value: string): [number, number][] {
  const nums = value.trim().split(/[\s,]+/).map(Number);
  const pts: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    pts.push([nums[i]!, nums[i + 1]!]);
  }
  return pts;
}

// ─── Presentation Attribute Parser ───────────────────────────────────────────

function parsePresentationAttrs(attrs: Record<string, string>): SvgPresentationAttributes {
  const out: SvgPresentationAttributes = {};

  if (attrs['fill'] !== undefined)           out.fill           = parseColor(attrs['fill']!);
  if (attrs['fill-opacity'] !== undefined)   out.fillOpacity    = parseFloat(attrs['fill-opacity']!);
  if (attrs['fill-rule'] !== undefined) {
    const fr = attrs['fill-rule']!;
    if (fr === 'nonzero' || fr === 'evenodd') out.fillRule = fr;
  }
  if (attrs['stroke'] !== undefined)         out.stroke         = parseColor(attrs['stroke']!);
  if (attrs['stroke-width'] !== undefined)   out.strokeWidth    = parseLength(attrs['stroke-width']!);
  if (attrs['stroke-opacity'] !== undefined) out.strokeOpacity  = parseFloat(attrs['stroke-opacity']!);
  if (attrs['stroke-linecap'] !== undefined) {
    const slc = attrs['stroke-linecap']!;
    if (slc === 'butt' || slc === 'round' || slc === 'square') out.strokeLinecap = slc;
  }
  if (attrs['stroke-linejoin'] !== undefined) {
    const slj = attrs['stroke-linejoin']!;
    if (slj === 'miter' || slj === 'round' || slj === 'bevel' || slj === 'arcs' || slj === 'miter-clip') {
      out.strokeLinejoin = slj;
    }
  }
  if (attrs['stroke-dasharray'] !== undefined) {
    out.strokeDasharray = attrs['stroke-dasharray']!.split(/[\s,]+/).map(Number);
  }
  if (attrs['stroke-dashoffset'] !== undefined) out.strokeDashoffset = parseFloat(attrs['stroke-dashoffset']!);
  if (attrs['stroke-miterlimit'] !== undefined)  out.strokeMiterlimit = parseFloat(attrs['stroke-miterlimit']!);
  if (attrs['opacity'] !== undefined)             out.opacity         = parseFloat(attrs['opacity']!);
  if (attrs['display'] !== undefined)             out.display         = attrs['display']!;
  if (attrs['visibility'] !== undefined) {
    const vis = attrs['visibility']!;
    if (vis === 'visible' || vis === 'hidden' || vis === 'collapse') out.visibility = vis;
  }
  if (attrs['clip-path'] !== undefined)    out.clipPath    = attrs['clip-path']!;
  if (attrs['clip-rule'] !== undefined) {
    const cr = attrs['clip-rule']!;
    if (cr === 'nonzero' || cr === 'evenodd') out.clipRule = cr;
  }
  if (attrs['mask'] !== undefined)         out.mask         = attrs['mask']!;
  if (attrs['filter'] !== undefined)       out.filter       = attrs['filter']!;
  if (attrs['pointer-events'] !== undefined) out.pointerEvents = attrs['pointer-events']!;

  return out;
}

// ─── Core Attribute Parser ───────────────────────────────────────────────────

function parseCoreAttrs(attrs: Record<string, string>): SvgCoreAttributes {
  const out: SvgCoreAttributes = {};
  if (attrs['id'] !== undefined)        out.id        = attrs['id']!;
  if (attrs['class'] !== undefined)     out.className = attrs['class']!;
  if (attrs['style'] !== undefined)     out.style     = attrs['style']!;
  if (attrs['transform'] !== undefined) out.transform = parseTransform(attrs['transform']!);
  return out;
}

// ─── Node → SvgElement ───────────────────────────────────────────────────────

const SUPPORTED_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'g']);
const SKIPPED_TAGS   = new Set(['defs', 'use', 'symbol', 'image', 'linearGradient', 'radialGradient', 'pattern', 'marker', 'filter', 'mask', 'clipPath', 'style', 'title', 'desc', 'metadata']);

function num(attrs: Record<string, string>, key: string, def = 0): number {
  return attrs[key] !== undefined ? parseFloat(attrs[key]!) : def;
}

function nodeToElement(tag: string, attrs: Record<string, string>, children: unknown[]): SvgElement | null {
  const core = parseCoreAttrs(attrs);
  const pres = parsePresentationAttrs(attrs);
  const base = { ...core, ...pres };

  switch (tag) {
    case 'path':
      return { ...base, type: 'path', d: attrs['d'] ?? '' };

    case 'rect':
      return {
        ...base, type: 'rect',
        x: num(attrs, 'x'), y: num(attrs, 'y'),
        width: num(attrs, 'width'), height: num(attrs, 'height'),
        ...(attrs['rx'] !== undefined ? { rx: parseFloat(attrs['rx']!) } : {}),
        ...(attrs['ry'] !== undefined ? { ry: parseFloat(attrs['ry']!) } : {}),
      };

    case 'circle':
      return { ...base, type: 'circle', cx: num(attrs, 'cx'), cy: num(attrs, 'cy'), r: num(attrs, 'r') };

    case 'ellipse':
      return { ...base, type: 'ellipse', cx: num(attrs, 'cx'), cy: num(attrs, 'cy'), rx: num(attrs, 'rx'), ry: num(attrs, 'ry') };

    case 'line':
      return { ...base, type: 'line', x1: num(attrs, 'x1'), y1: num(attrs, 'y1'), x2: num(attrs, 'x2'), y2: num(attrs, 'y2') };

    case 'polyline':
      return { ...base, type: 'polyline', points: parsePoints(attrs['points'] ?? '') };

    case 'polygon':
      return { ...base, type: 'polygon', points: parsePoints(attrs['points'] ?? '') };

    case 'text': {
      const el: SvgElement = {
        ...base, type: 'text',
        x: num(attrs, 'x'), y: num(attrs, 'y'),
        content: '',
        ...(attrs['font-size']   !== undefined ? { fontSize:   parseLength(attrs['font-size']!)   } : {}),
        ...(attrs['font-family'] !== undefined ? { fontFamily: attrs['font-family']!              } : {}),
        ...(attrs['font-weight'] !== undefined ? { fontWeight: attrs['font-weight']!              } : {}),
        ...(attrs['text-anchor'] !== undefined ? (() => {
          const ta = attrs['text-anchor']!;
          return (ta === 'start' || ta === 'middle' || ta === 'end') ? { textAnchor: ta as 'start' | 'middle' | 'end' } : {};
        })() : {}),
      };
      return el;
    }

    case 'g': {
      const childElements = collectElements(children);
      return { ...base, type: 'g', children: childElements };
    }

    default:
      return null;
  }
}

// ─── Tree Walker ──────────────────────────────────────────────────────────────

function extractAttrs(node: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === ':@' || k === '#text') continue;
    if (typeof v === 'string' || typeof v === 'number') {
      out[k] = String(v);
    }
  }
  // fast-xml-parser puts attributes under ':@'
  const atBlock = node[':@'];
  if (atBlock && typeof atBlock === 'object') {
    for (const [k, v] of Object.entries(atBlock as Record<string, unknown>)) {
      if (typeof v === 'string' || typeof v === 'number') {
        out[k] = String(v);
      }
    }
  }
  return out;
}

function collectElements(nodes: unknown[]): SvgElement[] {
  const result: SvgElement[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const obj = node as Record<string, unknown>;
    for (const [tag, value] of Object.entries(obj)) {
      if (tag === ':@' || tag === '#text') continue;
      if (SKIPPED_TAGS.has(tag)) continue;
      if (!SUPPORTED_TAGS.has(tag)) continue;

      const attrs = extractAttrs(obj);
      const children = Array.isArray(value) ? value as unknown[] : [];
      const el = nodeToElement(tag, attrs, children);
      if (el !== null) result.push(el);
    }
  }
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse an SVG XML string into a structured `SvgDocument`.
 * Uses `fast-xml-parser` — no DOM, works in Node and browser.
 */
export function parseSvgDocument(svgString: string): Result<SvgDocument> {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      preserveOrder: true,
      allowBooleanAttributes: true,
    });

    const parsed: unknown[] = parser.parse(svgString) as unknown[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, error: { code: 'invalid-xml', message: 'No root element found' } };
    }

    // Find the <svg> root
    let svgNode: Record<string, unknown> | undefined;
    for (const node of parsed) {
      if (node && typeof node === 'object' && 'svg' in (node as object)) {
        svgNode = node as Record<string, unknown>;
        break;
      }
    }

    if (!svgNode) {
      return { success: false, error: { code: 'invalid-xml', message: 'No <svg> root element found' } };
    }

    const svgAttrs = extractAttrs(svgNode);
    const svgChildren = Array.isArray(svgNode['svg']) ? svgNode['svg'] as unknown[] : [];

    const doc: SvgDocument = {
      elements: collectElements(svgChildren),
    };

    if (svgAttrs['viewBox'] !== undefined) {
      const vb = parseViewBox(svgAttrs['viewBox']!);
      if (vb !== undefined) doc.viewBox = vb;
    }
    if (svgAttrs['width'] !== undefined)  doc.width  = parseLength(svgAttrs['width']!);
    if (svgAttrs['height'] !== undefined) doc.height = parseLength(svgAttrs['height']!);

    return { success: true, data: doc };
  } catch {
    return { success: false, error: { code: 'invalid-xml', message: 'Failed to parse SVG XML' } };
  }
}
