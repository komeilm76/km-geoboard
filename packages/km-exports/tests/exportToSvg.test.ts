import { describe, it, expect } from 'vitest';
import { exportToSvg } from '../src/exportToSvg';
import type {
  Artboard,
  SvgElement,
  SvgRectElement,
  SvgCircleElement,
  SvgTextElement,
  SvgGroupElement,
} from '../src/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtboard(): Artboard {
  return {
    id: 'ab1',
    name: 'Test',
    origin: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 400, y: 300 },
    createdAt: 0,
  };
}

const rect: SvgRectElement = { type: 'rect', x: 10, y: 20, width: 100, height: 50 };
const circle: SvgCircleElement = { type: 'circle', cx: 50, cy: 50, r: 25 };
const textEl: SvgTextElement = { type: 'text', x: 10, y: 30, content: 'Hello' };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('exportToSvg', () => {
  it('returns a Result<string> with an SVG string on success', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect] });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(typeof result.data).toBe('string');
  });

  it('output includes correct viewBox from artboard', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect] });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toContain('viewBox="0 0 400 300"');
  });

  it('output includes xmlns', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect] });
    if (!result.success) return;
    expect(result.data).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('prepends XML declaration by default', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect] });
    if (!result.success) return;
    expect(result.data).toMatch(/^<\?xml version="1\.0"/);
  });

  it('omits XML declaration when xmlDeclaration: false', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toMatch(/^<svg/);
  });

  it('pretty: true adds newlines and indentation', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect], pretty: true });
    if (!result.success) return;
    expect(result.data).toContain('\n');
  });

  it('pretty: false produces a single line', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect], pretty: false });
    if (!result.success) return;
    expect(result.data.split('\n').length).toBeLessThanOrEqual(2); // at most 2 lines with XML decl
  });

  it('returns empty-export error when all elements are filtered out', () => {
    const result = exportToSvg({
      artboard: makeArtboard(),
      elements: [rect],
      filter: { includeIds: ['nonexistent'] },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('empty-export');
  });

  it('serializes rect element correctly', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [rect], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<rect');
    expect(result.data).toContain('x="10"');
    expect(result.data).toContain('y="20"');
    expect(result.data).toContain('width="100"');
    expect(result.data).toContain('height="50"');
  });

  it('serializes circle element correctly', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [circle], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<circle');
    expect(result.data).toContain('cx="50"');
    expect(result.data).toContain('cy="50"');
    expect(result.data).toContain('r="25"');
  });

  it('serializes text element correctly', () => {
    const result = exportToSvg({ artboard: makeArtboard(), elements: [textEl], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<text');
    expect(result.data).toContain('Hello');
  });

  it('serializes path element', () => {
    const path: SvgElement = { type: 'path', d: 'M 0 0 L 100 100' };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [path], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<path');
    expect(result.data).toContain('M 0 0 L 100 100');
  });

  it('serializes ellipse element', () => {
    const el: SvgElement = { type: 'ellipse', cx: 50, cy: 50, rx: 30, ry: 20 };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<ellipse');
  });

  it('serializes line element', () => {
    const el: SvgElement = { type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<line');
  });

  it('serializes polyline element', () => {
    const el: SvgElement = { type: 'polyline', points: [[0, 0], [50, 50], [100, 0]] };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<polyline');
    expect(result.data).toContain('0,0');
  });

  it('serializes polygon element', () => {
    const el: SvgElement = { type: 'polygon', points: [[0, 0], [100, 0], [50, 100]] };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<polygon');
  });

  it('serializes group element with children recursively', () => {
    const group: SvgGroupElement = { type: 'g', children: [rect, circle] };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [group], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('<g');
    expect(result.data).toContain('<rect');
    expect(result.data).toContain('<circle');
    expect(result.data).toContain('</g>');
  });

  it('serializes fill color as hex', () => {
    const el: SvgElement = { type: 'rect', x: 0, y: 0, width: 10, height: 10, fill: { type: 'hex', value: '#ff0000' } };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('fill="#ff0000"');
  });

  it('serializes fill: none correctly', () => {
    const el: SvgElement = { type: 'rect', x: 0, y: 0, width: 10, height: 10, fill: { type: 'none' } };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('fill="none"');
  });

  it('serializes fill: rgb correctly', () => {
    const el: SvgElement = { type: 'rect', x: 0, y: 0, width: 10, height: 10, fill: { type: 'rgb', r: 255, g: 0, b: 0 } };
    const result = exportToSvg({ artboard: makeArtboard(), elements: [el], xmlDeclaration: false });
    if (!result.success) return;
    expect(result.data).toContain('fill="rgb(255, 0, 0)"');
  });

  it('applies filter before serialization', () => {
    const elements: SvgElement[] = [
      { ...rect, id: 'keep' },
      { ...circle, id: 'drop' },
    ];
    const result = exportToSvg({
      artboard: makeArtboard(),
      elements,
      filter: { includeIds: ['keep'] },
      xmlDeclaration: false,
    });
    if (!result.success) return;
    expect(result.data).toContain('<rect');
    expect(result.data).not.toContain('<circle');
  });
});
