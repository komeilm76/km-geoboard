import { describe, it, expect } from 'vitest';
import { applyExportFilter } from '../src/filter';
import type { ExportFilter } from '../src/types';

// ─── Test data helpers ────────────────────────────────────────────────────────

type Item = { id?: string; layer?: string; type?: string; x?: number; y?: number; width?: number; height?: number };

const item = (id: string, layer?: string): Item => ({ id, layer });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('applyExportFilter', () => {
  it('returns items unchanged when filter is undefined', () => {
    const items = [item('a'), item('b'), item('c')];
    expect(applyExportFilter(items, undefined)).toEqual(items);
  });

  it('returns items unchanged when filter is empty object', () => {
    const items = [item('a'), item('b')];
    const filter: ExportFilter = {};
    expect(applyExportFilter(items, filter)).toEqual(items);
  });

  it('does not mutate the original array', () => {
    const items = [item('a'), item('b')];
    const original = [...items];
    applyExportFilter(items, { excludeIds: ['a'] });
    expect(items).toEqual(original);
  });

  // Step 1 — includeIds
  describe('includeIds', () => {
    it('keeps only items whose id is in the set', () => {
      const items = [item('a'), item('b'), item('c')];
      const result = applyExportFilter(items, { includeIds: ['a', 'c'] });
      expect(result.map((i) => i.id)).toEqual(['a', 'c']);
    });

    it('skips step when includeIds is empty array', () => {
      const items = [item('a'), item('b')];
      const result = applyExportFilter(items, { includeIds: [] });
      expect(result).toHaveLength(2);
    });

    it('skips items with no id when includeIds is set', () => {
      const items = [{ id: 'a' }, {}] as Item[];
      const result = applyExportFilter(items, { includeIds: ['a'] });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('a');
    });
  });

  // Step 2 — excludeIds
  describe('excludeIds', () => {
    it('removes items whose id is in the set', () => {
      const items = [item('a'), item('b'), item('c')];
      const result = applyExportFilter(items, { excludeIds: ['b'] });
      expect(result.map((i) => i.id)).toEqual(['a', 'c']);
    });

    it('keeps items with no id when excludeIds is set', () => {
      const items = [item('a'), {} as Item];
      const result = applyExportFilter(items, { excludeIds: ['a'] });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBeUndefined();
    });
  });

  // Step 3 — includeLayers
  describe('includeLayers', () => {
    it('keeps only items on the specified layers', () => {
      const items = [item('a', 'roads'), item('b', 'water'), item('c', 'roads')];
      const result = applyExportFilter(items, { includeLayers: ['roads'] });
      expect(result.map((i) => i.id)).toEqual(['a', 'c']);
    });

    it('keeps items with no layer when includeLayers is set (conservative)', () => {
      const items = [item('a', 'roads'), item('b')];
      const result = applyExportFilter(items, { includeLayers: ['roads'] });
      expect(result).toHaveLength(2);
    });

    it('skips step when includeLayers is empty array', () => {
      const items = [item('a', 'roads'), item('b', 'water')];
      const result = applyExportFilter(items, { includeLayers: [] });
      expect(result).toHaveLength(2);
    });
  });

  // Step 4 — excludeLayers
  describe('excludeLayers', () => {
    it('removes items on the specified layers', () => {
      const items = [item('a', 'roads'), item('b', 'water'), item('c', 'roads')];
      const result = applyExportFilter(items, { excludeLayers: ['roads'] });
      expect(result.map((i) => i.id)).toEqual(['b']);
    });

    it('keeps items with no layer when excludeLayers is set (conservative)', () => {
      const items = [item('a', 'roads'), item('b')];
      const result = applyExportFilter(items, { excludeLayers: ['roads'] });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('b');
    });
  });

  // Step 5 — boundingBox
  describe('boundingBox', () => {
    it('keeps rect items that intersect the box', () => {
      const items: Item[] = [
        { id: 'inside',  type: 'rect', x: 10, y: 10, width: 20, height: 20 },
        { id: 'outside', type: 'rect', x: 200, y: 200, width: 10, height: 10 },
      ];
      const result = applyExportFilter(items, { boundingBox: [0, 0, 100, 100] });
      expect(result.map((i) => i.id)).toEqual(['inside']);
    });

    it('keeps items with no geometry conservatively', () => {
      const items: Item[] = [{ id: 'nogeom' }];
      const result = applyExportFilter(items, { boundingBox: [0, 0, 50, 50] });
      expect(result).toHaveLength(1);
    });
  });

  // Combined filter
  it('applies all steps in correct order', () => {
    const items = [
      item('a', 'roads'),
      item('b', 'water'),
      item('c', 'roads'),
      item('d', 'roads'),
    ];
    const result = applyExportFilter(items, {
      includeIds: ['a', 'b', 'c', 'd'],
      excludeIds: ['d'],
      includeLayers: ['roads'],
    });
    // After includeIds: a, b, c, d
    // After excludeIds: a, b, c
    // After includeLayers: a, c (roads) + b has no layer that's roads — b passes conservatively? No, b has layer 'water' which is not 'roads'.
    // Wait: b has layer 'water'. includeLayers=['roads'] → only 'roads' pass (plus items with no layer).
    // b has layer 'water' — does NOT pass. So result: a, c.
    expect(result.map((i) => i.id)).toEqual(['a', 'c']);
  });
});
