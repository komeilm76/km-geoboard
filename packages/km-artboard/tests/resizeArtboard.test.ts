import { describe, it, expect } from 'vitest';
import { createArtboard } from '../src/createArtboard';
import { resizeArtboard } from '../src/resizeArtboard';

const FIXED_ID = '00000000-0000-4000-8000-000000000002';

function makeArtboard() {
  const result = createArtboard({
    startPoint: { x: 100, y: 80 },
    endPoint: { x: 400, y: 320 },
    name: 'Test',
    id: FIXED_ID,
  });
  if (!result.success) throw new Error('fixture creation failed');
  return result.artboard;
}

describe('resizeArtboard', () => {
  it('partial origin override changes only the specified axis', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, origin: { x: 50 } });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin.x).toBe(50);
    expect(result.artboard.origin.y).toBe(artboard.origin.y);
  });

  it('partial size override changes only the specified dimension', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, size: { width: 500 } });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.size.width).toBe(500);
    expect(result.artboard.size.height).toBe(artboard.size.height);
  });

  it('combined origin + size override', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({
      artboard,
      origin: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.origin).toEqual({ x: 0, y: 0 });
    expect(result.artboard.size).toEqual({ width: 200, height: 150 });
  });

  it('returns "too-small" when new width < minSize', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, size: { width: 0.5 }, minSize: 1 });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('returns "too-small" when new height < minSize', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, size: { height: 0.5 }, minSize: 1 });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('minSize defaults to 1', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, size: { width: 0.5 } });
    expect(result).toEqual({ success: false, reason: 'too-small' });
  });

  it('does not mutate the input artboard', () => {
    const artboard = makeArtboard();
    const originalOrigin = { ...artboard.origin };
    resizeArtboard({ artboard, origin: { x: 999 } });
    expect(artboard.origin).toEqual(originalOrigin);
  });

  it('non-geometry fields (id, name, createdAt) are preserved', () => {
    const artboard = makeArtboard();
    const result = resizeArtboard({ artboard, size: { width: 200 } });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.artboard.id).toBe(artboard.id);
    expect(result.artboard.name).toBe(artboard.name);
    expect(result.artboard.createdAt).toBe(artboard.createdAt);
  });
});
