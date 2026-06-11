import { describe, it, expect } from 'vitest';
import { createArtboard } from '../src/createArtboard';
import { moveArtboard } from '../src/moveArtboard';

const FIXED_ID = '00000000-0000-4000-8000-000000000003';

function makeArtboard() {
  const result = createArtboard({
    startPoint: { x: 100, y: 80 },
    endPoint: { x: 400, y: 320 },
    id: FIXED_ID,
  });
  if (!result.success) throw new Error('fixture creation failed');
  return result.artboard;
}

describe('moveArtboard', () => {
  it('positive delta moves origin right and down', () => {
    const artboard = makeArtboard();
    const moved = moveArtboard({ artboard, delta: { x: 50, y: 30 } });
    expect(moved.origin).toEqual({ x: 150, y: 110 });
  });

  it('negative delta moves origin left and up', () => {
    const artboard = makeArtboard();
    const moved = moveArtboard({ artboard, delta: { x: -50, y: -30 } });
    expect(moved.origin).toEqual({ x: 50, y: 50 });
  });

  it('zero delta returns artboard with equal origin', () => {
    const artboard = makeArtboard();
    const moved = moveArtboard({ artboard, delta: { x: 0, y: 0 } });
    expect(moved.origin).toEqual(artboard.origin);
  });

  it('does not mutate the input artboard', () => {
    const artboard = makeArtboard();
    const originalOrigin = { ...artboard.origin };
    moveArtboard({ artboard, delta: { x: 999, y: 999 } });
    expect(artboard.origin).toEqual(originalOrigin);
  });

  it('size is unchanged after move', () => {
    const artboard = makeArtboard();
    const moved = moveArtboard({ artboard, delta: { x: 50, y: 50 } });
    expect(moved.size).toEqual(artboard.size);
  });

  it('non-geometry fields (id, name, createdAt, startPoint, endPoint) are preserved', () => {
    const artboard = makeArtboard();
    const moved = moveArtboard({ artboard, delta: { x: 10, y: 10 } });
    expect(moved.id).toBe(artboard.id);
    expect(moved.name).toBe(artboard.name);
    expect(moved.createdAt).toBe(artboard.createdAt);
    expect(moved.startPoint).toEqual(artboard.startPoint);
    expect(moved.endPoint).toEqual(artboard.endPoint);
  });
});
