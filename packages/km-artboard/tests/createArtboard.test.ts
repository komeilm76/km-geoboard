import { describe, it, expect } from 'vitest';
import { createArtboard } from '../src/createArtboard';

// Helper: fixed ID for deterministic tests
const FIXED_ID = '00000000-0000-4000-8000-000000000001';

describe('createArtboard', () => {
  // ─── Normal drag ─────────────────────────────────────────────────────────

  it('normal drag (top-left → bottom-right): origin and size are correct', () => {
    const result = createArtboard({
      startPoint: { x: 100, y: 80 },
      endPoint: { x: 400, y: 320 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin).toEqual({ x: 100, y: 80 });
    expect(result.artboard.size).toEqual({ width: 300, height: 240 });
  });

  // ─── Reverse / mirrored drags ─────────────────────────────────────────────

  it('reverse drag (bottom-right → top-left): origin is normalized', () => {
    const result = createArtboard({
      startPoint: { x: 400, y: 320 },
      endPoint: { x: 100, y: 80 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin).toEqual({ x: 100, y: 80 });
    expect(result.artboard.size).toEqual({ width: 300, height: 240 });
  });

  it('drag mirrored on X only (top-right → bottom-left)', () => {
    const result = createArtboard({
      startPoint: { x: 400, y: 80 },
      endPoint: { x: 100, y: 320 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin).toEqual({ x: 100, y: 80 });
    expect(result.artboard.size).toEqual({ width: 300, height: 240 });
  });

  it('drag mirrored on Y only (bottom-left → top-right)', () => {
    const result = createArtboard({
      startPoint: { x: 100, y: 320 },
      endPoint: { x: 400, y: 80 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin).toEqual({ x: 100, y: 80 });
    expect(result.artboard.size).toEqual({ width: 300, height: 240 });
  });

  // ─── Name ─────────────────────────────────────────────────────────────────

  it('name defaults to "Artboard" when omitted', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.name).toBe('Artboard');
  });

  it('custom name is preserved', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
      name: 'My Frame',
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.name).toBe('My Frame');
  });

  // ─── ID ───────────────────────────────────────────────────────────────────

  it('custom id is preserved', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.id).toBe(FIXED_ID);
  });

  it('generated id is a valid UUID v4 when omitted', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  // ─── createdAt ────────────────────────────────────────────────────────────

  it('createdAt is a Unix timestamp in milliseconds', () => {
    const before = Date.now();
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
    });
    const after = Date.now();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.createdAt).toBeGreaterThanOrEqual(before);
    expect(result.artboard.createdAt).toBeLessThanOrEqual(after);
  });

  // ─── too-small ────────────────────────────────────────────────────────────

  it('returns "too-small" when width < minSize', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0.5, y: 100 },
      minSize: 1,
    });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('returns "too-small" when height < minSize', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 0.5 },
      minSize: 1,
    });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('returns "too-small" for a zero-size artboard', () => {
    const result = createArtboard({
      startPoint: { x: 50, y: 50 },
      endPoint: { x: 50, y: 50 },
    });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('minSize defaults to 1', () => {
    // width = 0.99, height = 100 — should be too-small with default minSize=1
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0.99, y: 100 },
    });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('custom minSize is respected', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 5, y: 5 },
      minSize: 10,
    });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('succeeds when dimensions exactly equal minSize', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 10 },
      minSize: 10,
      id: FIXED_ID,
    });
    expect(result.success).toBe(true);
  });

  // ─── invalid-input ────────────────────────────────────────────────────────

  it('returns "invalid-input" for NaN coordinates', () => {
    const result = createArtboard({
      startPoint: { x: NaN, y: 0 },
      endPoint: { x: 100, y: 100 },
    });
    expect(result).toEqual({ success: false, reason: 'invalid-input' });
  });

  it('returns "invalid-input" for Infinity coordinates', () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: Infinity, y: 100 },
    });
    expect(result).toEqual({ success: false, reason: 'invalid-input' });
  });

  it('returns "invalid-input" for -Infinity coordinates', () => {
    const result = createArtboard({
      startPoint: { x: -Infinity, y: 0 },
      endPoint: { x: 100, y: 100 },
    });
    expect(result).toEqual({ success: false, reason: 'invalid-input' });
  });

  // ─── Raw points are preserved ─────────────────────────────────────────────

  it('preserves startPoint and endPoint as-is', () => {
    const startPoint = { x: 400, y: 320 };
    const endPoint = { x: 100, y: 80 };
    const result = createArtboard({ startPoint, endPoint, id: FIXED_ID });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.startPoint).toEqual(startPoint);
    expect(result.artboard.endPoint).toEqual(endPoint);
  });
});
