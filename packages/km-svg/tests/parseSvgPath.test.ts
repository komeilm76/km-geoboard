import { describe, it, expect } from 'vitest';
import { parseSvgPath } from '../src/parseSvgPath';
import { serializeSvgPath } from '../src/serializeSvgPath';

describe('parseSvgPath', () => {
  it('parses a simple M L Z path', () => {
    const result = parseSvgPath('M 10 10 L 20 20 Z');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([
      { cmd: 'M', x: 10, y: 10 },
      { cmd: 'L', x: 20, y: 20 },
      { cmd: 'Z' },
    ]);
  });

  it('parses a path with cubic bezier (C command)', () => {
    const result = parseSvgPath('M 0 0 C 10 20 30 40 50 60');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([
      { cmd: 'M', x: 0, y: 0 },
      { cmd: 'C', x1: 10, y1: 20, x2: 30, y2: 40, x: 50, y: 60 },
    ]);
  });

  it('parses a path with arc (A command)', () => {
    const result = parseSvgPath('M 10 80 A 25 25 0 0 1 50 80');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[1]).toEqual({
      cmd: 'A', rx: 25, ry: 25, rotation: 0, largeArc: 0, sweep: 1, x: 50, y: 80,
    });
  });

  it('parses H and V commands', () => {
    const result = parseSvgPath('M 0 0 H 100 V 50');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([
      { cmd: 'M', x: 0, y: 0 },
      { cmd: 'H', x: 100 },
      { cmd: 'V', y: 50 },
    ]);
  });

  it('parses relative commands (lowercase)', () => {
    const result = parseSvgPath('m 5 5 l 10 10 h 20 v 30 z');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[0]).toEqual({ cmd: 'm', x: 5, y: 5 });
    expect(result.data[1]).toEqual({ cmd: 'l', x: 10, y: 10 });
    expect(result.data[2]).toEqual({ cmd: 'h', x: 20 });
    expect(result.data[3]).toEqual({ cmd: 'v', y: 30 });
    expect(result.data[4]).toEqual({ cmd: 'z' });
  });

  it('parses Q (quadratic bezier) command', () => {
    const result = parseSvgPath('M 0 0 Q 10 20 30 0');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[1]).toEqual({ cmd: 'Q', x1: 10, y1: 20, x: 30, y: 0 });
  });

  it('parses S and T commands', () => {
    const result = parseSvgPath('M 0 0 S 10 20 30 0 T 60 0');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[1]).toEqual({ cmd: 'S', x2: 10, y2: 20, x: 30, y: 0 });
    expect(result.data[2]).toEqual({ cmd: 'T', x: 60, y: 0 });
  });

  it('handles implicit repeated commands after M', () => {
    const result = parseSvgPath('M 10 10 20 20 30 30');
    expect(result.success).toBe(true);
    if (!result.success) return;
    // First is M, rest become implicit L
    expect(result.data[0]).toEqual({ cmd: 'M', x: 10, y: 10 });
    expect(result.data[1]).toEqual({ cmd: 'L', x: 20, y: 20 });
    expect(result.data[2]).toEqual({ cmd: 'L', x: 30, y: 30 });
  });

  it('returns error for empty non-empty string that does not start with M', () => {
    const result = parseSvgPath('L 10 10');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('invalid-input');
  });

  it('returns empty array for empty string', () => {
    const result = parseSvgPath('');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([]);
  });
});

describe('serializeSvgPath + parseSvgPath round-trip', () => {
  it('round-trips a simple path', () => {
    const original = 'M 10,10 L 20,20 Z';
    const parsed = parseSvgPath(original);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const serialized = serializeSvgPath(parsed.data);
    const reparsed = parseSvgPath(serialized);
    expect(reparsed.success).toBe(true);
    if (!reparsed.success) return;

    expect(reparsed.data).toEqual(parsed.data);
  });

  it('round-trips a complex path with curves and arcs', () => {
    const commands = [
      { cmd: 'M' as const, x: 0, y: 0 },
      { cmd: 'C' as const, x1: 10, y1: 20, x2: 30, y2: 40, x: 50, y: 60 },
      { cmd: 'A' as const, rx: 25, ry: 25, rotation: 0, largeArc: 0 as 0, sweep: 1 as 1, x: 100, y: 100 },
      { cmd: 'Z' as const },
    ];
    const serialized = serializeSvgPath(commands);
    const reparsed = parseSvgPath(serialized);
    expect(reparsed.success).toBe(true);
    if (!reparsed.success) return;
    expect(reparsed.data).toEqual(commands);
  });
});
