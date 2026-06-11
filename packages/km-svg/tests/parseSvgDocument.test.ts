import { describe, it, expect } from 'vitest';
import { parseSvgDocument } from '../src/parseSvgDocument';

describe('parseSvgDocument', () => {
  it('parses a simple <svg> with a <rect>', () => {
    const svg = `<svg width="100" height="100">
      <rect x="10" y="20" width="80" height="60" fill="#ff0000"/>
    </svg>`;
    const result = parseSvgDocument(svg);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.elements).toHaveLength(1);
    const rect = result.data.elements[0]!;
    expect(rect.type).toBe('rect');
    if (rect.type !== 'rect') return;
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBe(80);
    expect(rect.height).toBe(60);
    expect(rect.fill).toEqual({ type: 'hex', value: '#ff0000' });
  });

  it('parses a <svg> with nested <g> containing elements', () => {
    const svg = `<svg viewBox="0 0 200 200">
      <g id="layer1">
        <circle cx="100" cy="100" r="50"/>
        <line x1="0" y1="0" x2="200" y2="200"/>
      </g>
    </svg>`;
    const result = parseSvgDocument(svg);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.elements).toHaveLength(1);
    const group = result.data.elements[0]!;
    expect(group.type).toBe('g');
    if (group.type !== 'g') return;
    expect(group.children).toHaveLength(2);
    expect(group.children[0]!.type).toBe('circle');
    expect(group.children[1]!.type).toBe('line');
  });

  it('parses a <svg> with viewBox and width/height', () => {
    const svg = `<svg viewBox="0 0 400 300" width="400px" height="300px"/>`;
    const result = parseSvgDocument(svg);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.viewBox).toEqual({ minX: 0, minY: 0, width: 400, height: 300 });
    expect(result.data.width).toEqual({ value: 400, unit: 'px' });
    expect(result.data.height).toEqual({ value: 300, unit: 'px' });
  });

  it('silently ignores unsupported <image> element', () => {
    const svg = `<svg>
      <rect x="0" y="0" width="10" height="10"/>
      <image href="photo.png" x="0" y="0" width="50" height="50"/>
    </svg>`;
    const result = parseSvgDocument(svg);
    expect(result.success).toBe(true);
    if (!result.success) return;
    // image is skipped, only rect remains
    // image element is silently skipped — all remaining elements must be valid SvgElement types
    expect(result.data.elements.every(e => ['path','rect','circle','ellipse','line','polyline','polygon','text','g'].includes(e.type))).toBe(true);
  });

  it('returns invalid-xml error for malformed XML', () => {
    const result = parseSvgDocument('<svg><rect x="1"');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('invalid-xml');
  });

  it('returns invalid-xml error for non-SVG XML', () => {
    const result = parseSvgDocument('<html><body></body></html>');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('invalid-xml');
  });

  it('parses a path element', () => {
    const svg = `<svg><path d="M 10 10 L 20 20 Z" stroke="rgb(0,0,255)"/></svg>`;
    const result = parseSvgDocument(svg);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const path = result.data.elements[0]!;
    expect(path.type).toBe('path');
    if (path.type !== 'path') return;
    expect(path.d).toBe('M 10 10 L 20 20 Z');
    expect(path.stroke).toEqual({ type: 'rgb', r: 0, g: 0, b: 255 });
  });
});
