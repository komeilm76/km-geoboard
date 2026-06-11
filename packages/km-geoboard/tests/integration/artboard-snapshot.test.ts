/**
 * Integration: Artboard → JSON snapshot → importArtboardSnapshot, deep-equal.
 * Packages exercised: km-artboard, km-imports.
 */
import { describe, it, expect } from 'vitest';
import { artboard, imports } from '../../src/index';
import type { Artboard } from '@komeilm76/km-artboard';

function makeBoard(name: string, x2: number, y2: number): Artboard {
  const r = artboard.createArtboard({
    startPoint: { x: 0, y: 0 },
    endPoint: { x: x2, y: y2 },
    name,
  });
  if (!r.success) throw new Error(`artboard creation failed: ${r.reason}`);
  return r.artboard;
}

describe('Artboard snapshot export → import round-trip', () => {
  it('deep-equals after JSON round-trip (string input)', () => {
    const boards = [makeBoard('Main', 800, 600), makeBoard('Side', 400, 300)];
    const snapshot = JSON.stringify(boards);

    const imported = imports.importArtboardSnapshot(snapshot);
    expect(imported.success).toBe(true);
    if (!imported.success) return;

    expect(imported.data).toEqual(boards);
  });

  it('accepts an already-parsed object as input', () => {
    const boards = [makeBoard('Solo', 200, 200)];
    const imported = imports.importArtboardSnapshot(JSON.parse(JSON.stringify(boards)));
    expect(imported.success).toBe(true);
    if (!imported.success) return;
    expect(imported.data).toEqual(boards);
  });

  it('rejects structurally invalid snapshots', () => {
    const bad = imports.importArtboardSnapshot(JSON.stringify([{ id: 'x', notAnArtboard: true }]));
    expect(bad.success).toBe(false);
    if (bad.success) return;
    expect(bad.error.code).toBe('schema-mismatch');
  });
});
