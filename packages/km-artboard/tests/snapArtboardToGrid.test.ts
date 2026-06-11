import { describe, it, expect } from 'vitest';
import { createArtboard } from '../src/createArtboard';
import { snapArtboardToGrid } from '../src/snapArtboardToGrid';

const FIXED_ID = '00000000-0000-4000-8000-000000000005';

function makeArtboard(ox = 7, oy = 3, w = 13, h = 21) {
  const result = createArtboard({
    startPoint: { x: ox, y: oy },
    endPoint: { x: ox + w, y: oy + h },
    id: FIXED_ID,
  });
  if (!result.success) throw new Error('fixture creation failed');
  return result.artboard;
}

describe('snapArtboardToGrid', () => {
  // ─── "round" mode ──────────────────────────────────────────────────────────

  it('"round" mode: snaps origin.x=7 to nearest grid-8 → 8', () => {
    const artboard = makeArtboard(7, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' });
    expect(snapped.origin.x).toBe(8);
  });

  it('"round" mode: snaps origin.x=3 (below midpoint 4) → 0', () => {
    const artboard = makeArtboard(3, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' });
    expect(snapped.origin.x).toBe(0);
  });

  it('"round" mode: midpoint (4) snaps to 8 (rounds half-up for positive)', () => {
    const artboard = makeArtboard(4, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' });
    expect(snapped.origin.x).toBe(8);
  });

  it('"round" mode: size.width=13 snaps to 16', () => {
    const artboard = makeArtboard(0, 0, 13, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' });
    expect(snapped.size.width).toBe(16);
  });

  // ─── "floor" mode ─────────────────────────────────────────────────────────

  it('"floor" mode: snaps origin.x=7 down → 0', () => {
    const artboard = makeArtboard(7, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' });
    expect(snapped.origin.x).toBe(0);
  });

  it('"floor" mode: snaps size.width=13 down → 8', () => {
    const artboard = makeArtboard(0, 0, 13, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' });
    expect(snapped.size.width).toBe(8);
  });

  it('"floor" mode: exactly on grid line stays unchanged', () => {
    const artboard = makeArtboard(8, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' });
    expect(snapped.origin.x).toBe(8);
  });

  // ─── "ceil" mode ──────────────────────────────────────────────────────────

  it('"ceil" mode: snaps origin.x=1 up → 8', () => {
    const artboard = makeArtboard(1, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' });
    expect(snapped.origin.x).toBe(8);
  });

  it('"ceil" mode: snaps size.width=9 up → 16', () => {
    const artboard = makeArtboard(0, 0, 9, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' });
    expect(snapped.size.width).toBe(16);
  });

  it('"ceil" mode: exactly on grid line stays unchanged', () => {
    const artboard = makeArtboard(8, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' });
    expect(snapped.origin.x).toBe(8);
  });

  // ─── Defaults ─────────────────────────────────────────────────────────────

  it('default gridSize is 8', () => {
    const artboard = makeArtboard(7, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard }); // no gridSize or mode
    expect(snapped.origin.x).toBe(8);
  });

  it('default mode is "round"', () => {
    const artboard = makeArtboard(3, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8 }); // no mode
    expect(snapped.origin.x).toBe(0); // 3 rounds down to 0
  });

  // ─── Custom gridSize ──────────────────────────────────────────────────────

  it('custom gridSize=16: snaps origin.x=7 → 0', () => {
    const artboard = makeArtboard(7, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 16, mode: 'round' });
    expect(snapped.origin.x).toBe(0);
  });

  it('custom gridSize=10: snaps origin.x=7 → 10', () => {
    const artboard = makeArtboard(7, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 10, mode: 'round' });
    expect(snapped.origin.x).toBe(10);
  });

  // ─── Negative coordinates ─────────────────────────────────────────────────

  it('"floor" mode with negative origin: -3 snaps to -8', () => {
    const artboard = makeArtboard(-3, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' });
    expect(snapped.origin.x).toBe(-8);
  });

  it('"ceil" mode with negative origin: -3 snaps to 0', () => {
    const artboard = makeArtboard(-3, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' });
    expect(snapped.origin.x).toBe(0);
  });

  it('"round" mode with negative midpoint: -4 (half of 8) snaps to -4 (tie-break toward even)', () => {
    // Math.round(-4 / 8) * 8 = Math.round(-0.5) * 8
    // In JS, Math.round(-0.5) = 0 (rounds toward +Infinity)
    const artboard = makeArtboard(-4, 0, 100, 100);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' });
    expect(snapped.origin.x).toBe(0);
  });

  // ─── Zero value ───────────────────────────────────────────────────────────

  it('zero values stay zero in all modes', () => {
    const artboard = makeArtboard(0, 0, 8, 8);
    expect(snapArtboardToGrid({ artboard, gridSize: 8, mode: 'round' }).origin.x).toBe(0);
    expect(snapArtboardToGrid({ artboard, gridSize: 8, mode: 'floor' }).origin.x).toBe(0);
    expect(snapArtboardToGrid({ artboard, gridSize: 8, mode: 'ceil' }).origin.x).toBe(0);
  });

  // ─── gridSize <= 0 guard ──────────────────────────────────────────────────

  it('gridSize=0 returns artboard unchanged', () => {
    const artboard = makeArtboard(7, 3, 13, 21);
    const snapped = snapArtboardToGrid({ artboard, gridSize: 0 });
    expect(snapped).toBe(artboard); // same reference
  });

  it('gridSize=-1 returns artboard unchanged', () => {
    const artboard = makeArtboard(7, 3, 13, 21);
    const snapped = snapArtboardToGrid({ artboard, gridSize: -1 });
    expect(snapped).toBe(artboard);
  });

  // ─── Immutability ─────────────────────────────────────────────────────────

  it('does not mutate the input artboard', () => {
    const artboard = makeArtboard(7, 3, 13, 21);
    const origOrigin = { ...artboard.origin };
    snapArtboardToGrid({ artboard, gridSize: 8 });
    expect(artboard.origin).toEqual(origOrigin);
  });

  // ─── Non-geometry fields preserved ───────────────────────────────────────

  it('id, name, createdAt, startPoint, endPoint are all preserved', () => {
    const artboard = makeArtboard();
    const snapped = snapArtboardToGrid({ artboard, gridSize: 8 });
    expect(snapped.id).toBe(artboard.id);
    expect(snapped.name).toBe(artboard.name);
    expect(snapped.createdAt).toBe(artboard.createdAt);
    expect(snapped.startPoint).toEqual(artboard.startPoint);
    expect(snapped.endPoint).toEqual(artboard.endPoint);
  });
});
