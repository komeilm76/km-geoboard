import { describe, it, expect } from 'vitest';
import { exportToPdfMeta } from '../src/exportToPdfMeta';
import type { Artboard, SvgElement } from '../src/types';

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

const rect: SvgElement = { type: 'rect', x: 0, y: 0, width: 100, height: 50 };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('exportToPdfMeta', () => {
  it('returns a Result<PdfMeta> on success', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect]);
    expect(result.success).toBe(true);
  });

  it('A4 portrait — correct page dimensions', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { pageSize: 'A4', orientation: 'portrait' });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBeCloseTo(595.28, 1);
    expect(result.data.pageSize.height).toBeCloseTo(841.89, 1);
  });

  it('A4 landscape — width and height swapped', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { pageSize: 'A4', orientation: 'landscape' });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBeCloseTo(841.89, 1);
    expect(result.data.pageSize.height).toBeCloseTo(595.28, 1);
  });

  it('A3 portrait — correct page dimensions', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { pageSize: 'A3' });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBeCloseTo(841.89, 1);
    expect(result.data.pageSize.height).toBeCloseTo(1190.55, 1);
  });

  it('Letter portrait — correct page dimensions', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { pageSize: 'Letter' });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBe(612);
    expect(result.data.pageSize.height).toBe(792);
  });

  it('custom page size — passed through unchanged', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { pageSize: { width: 300, height: 400 } });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBe(300);
    expect(result.data.pageSize.height).toBe(400);
  });

  it('custom page size landscape — swapped correctly', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], {
      pageSize: { width: 300, height: 400 },
      orientation: 'landscape',
    });
    if (!result.success) return;
    expect(result.data.pageSize.width).toBe(400);
    expect(result.data.pageSize.height).toBe(300);
  });

  it('svgContent is a non-empty string starting with <svg', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect]);
    if (!result.success) return;
    expect(result.data.svgContent).toBeTruthy();
    expect(result.data.svgContent).toMatch(/^<svg/);
  });

  it('svgContent does not include XML declaration', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect]);
    if (!result.success) return;
    expect(result.data.svgContent).not.toContain('<?xml');
  });

  it('title passed through when provided', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { title: 'My Map' });
    if (!result.success) return;
    expect(result.data.title).toBe('My Map');
  });

  it('author passed through when provided', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { author: 'Alice' });
    if (!result.success) return;
    expect(result.data.author).toBe('Alice');
  });

  it('title and author are undefined when not provided', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect]);
    if (!result.success) return;
    expect(result.data.title).toBeUndefined();
    expect(result.data.author).toBeUndefined();
  });

  it('artboard reference is the same object in output', () => {
    const ab = makeArtboard();
    const result = exportToPdfMeta(ab, [rect]);
    if (!result.success) return;
    expect(result.data.artboard).toBe(ab);
  });

  it('orientation is preserved in PdfMeta', () => {
    const result = exportToPdfMeta(makeArtboard(), [rect], { orientation: 'landscape' });
    if (!result.success) return;
    expect(result.data.orientation).toBe('landscape');
  });

  it('propagates empty-export error when filter removes all elements', () => {
    const result = exportToPdfMeta(makeArtboard(), [{ ...rect, id: 'r1' }], {
      filter: { includeIds: ['nonexistent'] },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('empty-export');
  });
});
