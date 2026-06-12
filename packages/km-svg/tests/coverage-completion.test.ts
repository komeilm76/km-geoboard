/**
 * Coverage completion for T-013: exercises the public barrel (src/index),
 * the Zod schemas, the attribute/transform/color/length parsers, full-document
 * parsing across every element type, path serialization round-trips, and
 * SVG→GeoJSON conversion branches.
 */
import { describe, expect, it } from 'vitest';
import {
  SvgColorSchema,
  SvgDocumentSchema,
  SvgGeoMetaSchema,
  SvgTransformSchema,
  SvgViewBoxSchema,
  parseColor,
  parseLength,
  parseSvgDocument,
  parseSvgPath,
  parseTransform,
  parseViewBox,
  serializeSvgPath,
  svgDocumentToFeatureCollection,
} from '../src/index';
import type { SvgGeoMeta } from '../src/index';

const META: SvgGeoMeta = {
  svgBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  geoBounds: [-180, -90, 180, 90],
};

const RICH_SVG = `
<svg viewBox="0 0 100 100" width="100px" height="100px">
  <rect x="1" y="2" width="10" height="10"
        fill="#ff0000" stroke="rgb(0, 10, 20)" stroke-width="2px"
        fill-rule="evenodd" opacity="0.5" transform="translate(1,2) scale(2,3)" id="r1"/>
  <circle cx="50" cy="50" r="10" fill="rgba(1, 2, 3, 0.5)" stroke="none"/>
  <ellipse cx="40" cy="40" rx="8" ry="4" fill="rebeccapurple"/>
  <line x1="0" y1="0" x2="10" y2="10" stroke="#00ff00"/>
  <polyline points="0,0 5,5 10,0" fill="none"/>
  <polygon points="0,0 10,0 10,10 0,10"/>
  <text x="5" y="5">hello</text>
  <g transform="rotate(45 50 50) skewX(10) skewY(20) matrix(1,0,0,1,5,5)">
    <path d="M 0 0 L 10 10 Z"/>
  </g>
</svg>`;

describe('parseColor variants', () => {
  it('none and empty', () => {
    expect(parseColor('none')).toEqual({ type: 'none' });
    expect(parseColor('')).toEqual({ type: 'none' });
  });
  it('hex / rgb / rgba / named', () => {
    expect(parseColor('#abc')).toEqual({ type: 'hex', value: '#abc' });
    expect(parseColor('rgb(1, 2, 3)')).toEqual({ type: 'rgb', r: 1, g: 2, b: 3 });
    expect(parseColor('rgba(1, 2, 3, 0.5)')).toEqual({ type: 'rgba', r: 1, g: 2, b: 3, a: 0.5 });
    expect(parseColor('tomato')).toEqual({ type: 'named', value: 'tomato' });
  });
});

describe('parseLength / parseViewBox / parseTransform', () => {
  it('parses lengths with and without units', () => {
    expect(parseLength('10px')).toEqual({ value: 10, unit: 'px' });
    expect(parseLength('2.5')).toEqual({ value: 2.5, unit: '' });
  });
  it('parses a viewBox and rejects malformed input', () => {
    expect(parseViewBox('0 0 100 100')).toEqual({ minX: 0, minY: 0, width: 100, height: 100 });
    expect(parseViewBox('not a viewbox')).toBeUndefined();
  });
  it('parses every transform operation', () => {
    const ops = parseTransform('translate(1,2) scale(2,3) rotate(45 5 6) skewX(10) skewY(20) matrix(1,0,0,1,5,5)');
    expect(ops.map((o) => o.type)).toEqual(['translate', 'scale', 'rotate', 'skewX', 'skewY', 'matrix']);
  });
});

describe('full-document parsing across element types', () => {
  it('parses every supported element with presentation attributes', () => {
    const doc = parseSvgDocument(RICH_SVG);
    expect(doc.success).toBe(true);
    if (!doc.success) return;
    const types = doc.data.elements.map((c) => c.type);
    expect(types).toEqual(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'g']);
  });
  it('parsed document validates against SvgDocumentSchema (recursive groups)', () => {
    const doc = parseSvgDocument(RICH_SVG);
    expect(doc.success).toBe(true);
    if (!doc.success) return;
    expect(SvgDocumentSchema.safeParse(doc.data).success).toBe(true);
  });
});

describe('schemas validate and reject', () => {
  it('SvgColorSchema / SvgViewBoxSchema / SvgTransformSchema / SvgGeoMetaSchema', () => {
    expect(SvgColorSchema.safeParse({ type: 'hex', value: '#fff' }).success).toBe(true);
    expect(SvgColorSchema.safeParse({ type: 'banana' }).success).toBe(false);
    expect(SvgViewBoxSchema.safeParse({ minX: 0, minY: 0, width: 1, height: 1 }).success).toBe(true);
    expect(SvgTransformSchema.safeParse([{ type: 'skewX', angle: 5 }]).success).toBe(true);
    expect(SvgGeoMetaSchema.safeParse(META).success).toBe(true);
    expect(SvgGeoMetaSchema.safeParse({ svgBounds: META.svgBounds }).success).toBe(false);
  });
});

describe('path serialization round-trip (all command kinds)', () => {
  it('serializes absolute and relative commands', () => {
    const d = 'M 0,0 L 10,10 H 20 V 30 C 1,2 3,4 5,6 S 7,8 9,10 Q 1,2 3,4 T 5,6 A 5,5 0 1 0 10,10 Z';
    const parsed = parseSvgPath(d);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const out = serializeSvgPath(parsed.data);
    expect(out).toContain('H 20');
    expect(out).toContain('V 30');
    expect(out).toContain('A 5,5 0 1 0 10,10');
    expect(out.endsWith('Z')).toBe(true);

    const rel = parseSvgPath('m 1,1 l 2,2 h 3 v 4 q 1,1 2,2 t 1,1 s 1,1 2,2 z');
    expect(rel.success).toBe(true);
    if (!rel.success) return;
    expect(serializeSvgPath(rel.data).startsWith('m 1,1')).toBe(true);
  });
});

describe('SVG → GeoJSON conversion branches', () => {
  it('converts every geometry-bearing element type', () => {
    const geomSvg = `
<svg viewBox="0 0 100 100">
  <rect x="0" y="0" width="10" height="10"/>
  <circle cx="50" cy="50" r="10"/>
  <ellipse cx="40" cy="40" rx="8" ry="4"/>
  <line x1="0" y1="0" x2="10" y2="10"/>
  <polyline points="0,0 5,5 10,0"/>
  <polygon points="0,0 10,0 10,10 0,10"/>
  <path d="M 0 0 L 10 10 C 1 2 3 4 5 6 Q 7 8 9 10 Z"/>
  <g><rect x="1" y="1" width="2" height="2"/><circle cx="3" cy="3" r="1"/></g>
</svg>`;
    const doc = parseSvgDocument(geomSvg);
    expect(doc.success).toBe(true);
    if (!doc.success) return;
    const fc = svgDocumentToFeatureCollection(doc.data, META);
    expect(fc.success).toBe(true);
    if (!fc.success) return;
    const kinds = fc.data.features.map((f) => f.geometry?.type);
    expect(kinds).toContain('Polygon');
    expect(kinds).toContain('LineString');
    expect(kinds).toContain('GeometryCollection');
    expect(fc.data.features.length).toBe(8);
  });
});

describe('kitchen-sink attributes and relative path commands', () => {
  it('parses every presentation/core attribute, including invalid enum fallbacks', () => {
    const svg = `
<svg viewBox="0 0 100 100">
  <rect x="0" y="0" width="5" height="5" rx="1" ry="2"
        stroke-linecap="round" stroke-linejoin="bevel"
        stroke-dasharray="1 2 3" stroke-dashoffset="4" stroke-miterlimit="2"
        display="inline" visibility="hidden" clip-path="url(#c)" clip-rule="evenodd"
        mask="url(#m)" filter="url(#f)" pointer-events="none"
        class="k" style="x:1" fill-rule="banana" stroke-linecap-x="ignored"/>
  <rect x="0" y="0" width="5" height="5"
        stroke-linecap="banana" stroke-linejoin="banana" visibility="banana" clip-rule="banana"/>
  <text x="1" y="2" font-size="12px" font-family="serif" font-weight="bold" text-anchor="middle">t</text>
  <text x="1" y="2" text-anchor="banana">t2</text>
</svg>`;
    const doc = parseSvgDocument(svg);
    expect(doc.success).toBe(true);
    if (!doc.success) return;
    const [r1, r2, t1, t2] = doc.data.elements;
    expect(r1).toMatchObject({
      type: 'rect', rx: 1, ry: 2,
      strokeLinecap: 'round', strokeLinejoin: 'bevel',
      strokeDasharray: [1, 2, 3], strokeDashoffset: 4, strokeMiterlimit: 2,
      visibility: 'hidden', clipRule: 'evenodd', className: 'k',
    });
    expect(r2).not.toHaveProperty('strokeLinecap');
    expect(r2).not.toHaveProperty('visibility');
    expect(t1).toMatchObject({ type: 'text', fontFamily: 'serif', fontWeight: 'bold', textAnchor: 'middle' });
    expect(t2).not.toHaveProperty('textAnchor');
  });

  it('converts relative and arc path commands, open vs closed paths, and text→Point', () => {
    const svg = `
<svg viewBox="0 0 100 100">
  <path d="m 1,1 l 2,2 h 3 v 4 c 1,1 2,2 3,3 s 1,1 2,2 q 1,1 2,2 t 1,1 a 5,5 0 0 1 3,3"/>
  <path d="M 0,0 H 10 V 10 A 5,5 0 0 1 0,10 S 1,1 2,2 T 3,3 Z"/>
  <text x="5" y="5">label</text>
</svg>`;
    const doc = parseSvgDocument(svg);
    expect(doc.success).toBe(true);
    if (!doc.success) return;
    const fc = svgDocumentToFeatureCollection(doc.data, META);
    expect(fc.success).toBe(true);
    if (!fc.success) return;
    const kinds = fc.data.features.map((f) => f.geometry?.type);
    expect(kinds[0]).toBe('LineString'); // open relative path
    expect(kinds[1]).toBe('Polygon');    // closed path
    expect(kinds[2]).toBe('Point');      // text anchor
  });
});
