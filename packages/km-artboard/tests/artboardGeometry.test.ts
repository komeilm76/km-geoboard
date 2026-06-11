import { describe, it, expect } from 'vitest';
import { createArtboard } from '../src/createArtboard';
import { artboardToRect, artboardFromRect } from '../src/artboardToRect';
import { artboardContainsPoint } from '../src/artboardContainsPoint';
import { artboardsOverlap } from '../src/artboardsOverlap';

const FIXED_ID = '00000000-0000-4000-8000-000000000004';

function makeArtboard(x = 100, y = 80, w = 300, h = 240) {
  const result = createArtboard({
    startPoint: { x, y },
    endPoint: { x: x + w, y: y + h },
    id: FIXED_ID,
  });
  if (!result.success) throw new Error('fixture creation failed');
  return result.artboard;
}

// ─── artboardToRect / artboardFromRect ────────────────────────────────────────

describe('artboardToRect', () => {
  it('returns [x, y, width, height] tuple', () => {
    const artboard = makeArtboard(10, 20, 300, 200);
    expect(artboardToRect(artboard)).toEqual([10, 20, 300, 200]);
  });
});

describe('artboardFromRect', () => {
  it('round-trip: artboardToRect(artboardFromRect(rect)) equals rect', () => {
    const rect: [number, number, number, number] = [10, 20, 300, 200];
    const result = artboardFromRect(rect);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(artboardToRect(result.artboard)).toEqual(rect);
  });

  it('passes name option through to createArtboard', () => {
    const result = artboardFromRect([0, 0, 100, 100], { name: 'From Rect' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.name).toBe('From Rect');
  });

  it('returns too-small for zero-size rect', () => {
    const result = artboardFromRect([0, 0, 0, 0]);
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });
});

// ─── artboardContainsPoint ────────────────────────────────────────────────────

describe('artboardContainsPoint', () => {
  it('returns true for a point clearly inside', () => {
    const artboard = makeArtboard(0, 0, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 50, y: 50 })).toBe(true);
  });

  it('returns true for point on the top-left corner (origin)', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 10, y: 20 })).toBe(true);
  });

  it('returns true for point on the bottom-right corner', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 110, y: 120 })).toBe(true);
  });

  it('returns true for point on the top-right corner', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 110, y: 20 })).toBe(true);
  });

  it('returns true for point on the bottom-left corner', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 10, y: 120 })).toBe(true);
  });

  it('returns false for a point outside (left)', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 9, y: 50 })).toBe(false);
  });

  it('returns false for a point outside (above)', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 50, y: 19 })).toBe(false);
  });

  it('returns false for a point outside (right)', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 111, y: 50 })).toBe(false);
  });

  it('returns false for a point outside (below)', () => {
    const artboard = makeArtboard(10, 20, 100, 100);
    expect(artboardContainsPoint(artboard, { x: 50, y: 121 })).toBe(false);
  });
});

// ─── artboardsOverlap ─────────────────────────────────────────────────────────

describe('artboardsOverlap', () => {
  it('returns true for overlapping artboards', () => {
    const a = makeArtboard(0, 0, 100, 100);
    const b = makeArtboard(50, 50, 100, 100);
    expect(artboardsOverlap(a, b)).toBe(true);
  });

  it('returns true when touching at right/left edges', () => {
    const a = makeArtboard(0, 0, 100, 100);  // right edge at x=100
    const b = makeArtboard(100, 0, 100, 100); // left edge at x=100
    expect(artboardsOverlap(a, b)).toBe(true);
  });

  it('returns true when touching at top/bottom edges', () => {
    const a = makeArtboard(0, 0, 100, 100);   // bottom edge at y=100
    const b = makeArtboard(0, 100, 100, 100); // top edge at y=100
    expect(artboardsOverlap(a, b)).toBe(true);
  });

  it('returns true when one artboard is fully inside the other', () => {
    const a = makeArtboard(0, 0, 200, 200);
    const b = makeArtboard(50, 50, 50, 50);
    expect(artboardsOverlap(a, b)).toBe(true);
  });

  it('returns false when separated on x-axis', () => {
    const a = makeArtboard(0, 0, 100, 100);
    const b = makeArtboard(101, 0, 100, 100);
    expect(artboardsOverlap(a, b)).toBe(false);
  });

  it('returns false when separated on y-axis', () => {
    const a = makeArtboard(0, 0, 100, 100);
    const b = makeArtboard(0, 101, 100, 100);
    expect(artboardsOverlap(a, b)).toBe(false);
  });

  it('is commutative: overlap(a, b) === overlap(b, a)', () => {
    const a = makeArtboard(0, 0, 100, 100);
    const b = makeArtboard(50, 50, 100, 100);
    expect(artboardsOverlap(a, b)).toBe(artboardsOverlap(b, a));
  });
});
