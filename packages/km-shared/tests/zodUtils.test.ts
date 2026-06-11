import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  nonEmptyString,
  positiveNumber,
  nonNegativeNumber,
  finiteNumber,
  uuid,
  unixTimestampMs,
  pointSchema,
  latLngSchema,
  colorHexSchema,
  percentSchema,
  opacitySchema,
  boundingBoxSchema,
  withDefault,
} from '../src/zodUtils';

// ─── nonEmptyString ────────────────────────────────────────────────────────────

describe('nonEmptyString', () => {
  it('accepts a normal string', () => {
    expect(nonEmptyString().parse('hello')).toBe('hello');
  });

  it('trims and accepts whitespace-padded string', () => {
    expect(nonEmptyString().parse('  hello  ')).toBe('hello');
  });

  it('rejects an empty string', () => {
    expect(nonEmptyString().safeParse('').success).toBe(false);
  });

  it('rejects a whitespace-only string', () => {
    expect(nonEmptyString().safeParse('   ').success).toBe(false);
  });
});

// ─── positiveNumber ────────────────────────────────────────────────────────────

describe('positiveNumber', () => {
  it('accepts a positive integer', () => {
    expect(positiveNumber().parse(1)).toBe(1);
  });

  it('accepts a positive float', () => {
    expect(positiveNumber().parse(0.001)).toBe(0.001);
  });

  it('rejects zero', () => {
    expect(positiveNumber().safeParse(0).success).toBe(false);
  });

  it('rejects a negative number', () => {
    expect(positiveNumber().safeParse(-1).success).toBe(false);
  });
});

// ─── nonNegativeNumber ─────────────────────────────────────────────────────────

describe('nonNegativeNumber', () => {
  it('accepts zero', () => {
    expect(nonNegativeNumber().parse(0)).toBe(0);
  });

  it('accepts a positive number', () => {
    expect(nonNegativeNumber().parse(5)).toBe(5);
  });

  it('rejects a negative number', () => {
    expect(nonNegativeNumber().safeParse(-0.001).success).toBe(false);
  });
});

// ─── finiteNumber ──────────────────────────────────────────────────────────────

describe('finiteNumber', () => {
  it('accepts zero', () => {
    expect(finiteNumber().parse(0)).toBe(0);
  });

  it('accepts a negative float', () => {
    expect(finiteNumber().parse(-1.5)).toBe(-1.5);
  });

  it('rejects NaN', () => {
    expect(finiteNumber().safeParse(NaN).success).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(finiteNumber().safeParse(Infinity).success).toBe(false);
  });

  it('rejects -Infinity', () => {
    expect(finiteNumber().safeParse(-Infinity).success).toBe(false);
  });
});

// ─── uuid ──────────────────────────────────────────────────────────────────────

describe('uuid', () => {
  it('accepts a valid UUID v4', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    expect(uuid().parse(id)).toBe(id);
  });

  it('rejects a non-uuid string', () => {
    expect(uuid().safeParse('not-a-uuid').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(uuid().safeParse('').success).toBe(false);
  });
});

// ─── unixTimestampMs ───────────────────────────────────────────────────────────

describe('unixTimestampMs', () => {
  it('accepts zero', () => {
    expect(unixTimestampMs().parse(0)).toBe(0);
  });

  it('accepts a realistic timestamp', () => {
    const now = Date.now();
    expect(unixTimestampMs().parse(now)).toBe(now);
  });

  it('rejects a negative value', () => {
    expect(unixTimestampMs().safeParse(-1).success).toBe(false);
  });

  it('rejects a float', () => {
    expect(unixTimestampMs().safeParse(1.5).success).toBe(false);
  });
});

// ─── pointSchema ───────────────────────────────────────────────────────────────

describe('pointSchema', () => {
  it('accepts a valid point', () => {
    expect(pointSchema().parse({ x: 0, y: -5 })).toEqual({ x: 0, y: -5 });
  });

  it('accepts floating-point coordinates', () => {
    expect(pointSchema().parse({ x: 1.5, y: -3.14 })).toEqual({ x: 1.5, y: -3.14 });
  });

  it('rejects NaN in x', () => {
    expect(pointSchema().safeParse({ x: NaN, y: 0 }).success).toBe(false);
  });

  it('rejects NaN in y', () => {
    expect(pointSchema().safeParse({ x: 0, y: NaN }).success).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(pointSchema().safeParse({ x: Infinity, y: 0 }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(pointSchema().safeParse({ x: 1 }).success).toBe(false);
  });
});

// ─── latLngSchema ──────────────────────────────────────────────────────────────

describe('latLngSchema', () => {
  it('accepts valid coordinates', () => {
    expect(latLngSchema().parse({ lat: 0, lng: 0 })).toEqual({ lat: 0, lng: 0 });
  });

  it('accepts boundary values', () => {
    expect(latLngSchema().parse({ lat: 90, lng: 180 })).toEqual({ lat: 90, lng: 180 });
    expect(latLngSchema().parse({ lat: -90, lng: -180 })).toEqual({ lat: -90, lng: -180 });
  });

  it('rejects lat > 90', () => {
    expect(latLngSchema().safeParse({ lat: 91, lng: 0 }).success).toBe(false);
  });

  it('rejects lat < -90', () => {
    expect(latLngSchema().safeParse({ lat: -91, lng: 0 }).success).toBe(false);
  });

  it('rejects lng > 180', () => {
    expect(latLngSchema().safeParse({ lat: 0, lng: 181 }).success).toBe(false);
  });

  it('rejects lng < -180', () => {
    expect(latLngSchema().safeParse({ lat: 0, lng: -181 }).success).toBe(false);
  });
});

// ─── colorHexSchema ────────────────────────────────────────────────────────────

describe('colorHexSchema', () => {
  it('accepts a 6-digit hex color', () => {
    expect(colorHexSchema().parse('#ff0000')).toBe('#ff0000');
  });

  it('accepts a 3-digit hex color', () => {
    expect(colorHexSchema().parse('#f00')).toBe('#f00');
  });

  it('accepts uppercase hex', () => {
    expect(colorHexSchema().parse('#FF0000')).toBe('#FF0000');
  });

  it('rejects a named color', () => {
    expect(colorHexSchema().safeParse('red').success).toBe(false);
  });

  it('rejects a hex color without #', () => {
    expect(colorHexSchema().safeParse('ff0000').success).toBe(false);
  });

  it('rejects invalid hex length', () => {
    expect(colorHexSchema().safeParse('#ff00').success).toBe(false);
  });
});

// ─── percentSchema ─────────────────────────────────────────────────────────────

describe('percentSchema', () => {
  it('accepts 0', () => {
    expect(percentSchema().parse(0)).toBe(0);
  });

  it('accepts 100', () => {
    expect(percentSchema().parse(100)).toBe(100);
  });

  it('accepts a mid value', () => {
    expect(percentSchema().parse(50)).toBe(50);
  });

  it('rejects a value above 100', () => {
    expect(percentSchema().safeParse(100.1).success).toBe(false);
  });

  it('rejects a negative value', () => {
    expect(percentSchema().safeParse(-1).success).toBe(false);
  });
});

// ─── opacitySchema ─────────────────────────────────────────────────────────────

describe('opacitySchema', () => {
  it('accepts 0', () => {
    expect(opacitySchema().parse(0)).toBe(0);
  });

  it('accepts 1', () => {
    expect(opacitySchema().parse(1)).toBe(1);
  });

  it('accepts 0.5', () => {
    expect(opacitySchema().parse(0.5)).toBe(0.5);
  });

  it('rejects a value above 1', () => {
    expect(opacitySchema().safeParse(1.1).success).toBe(false);
  });

  it('rejects a negative value', () => {
    expect(opacitySchema().safeParse(-0.1).success).toBe(false);
  });
});

// ─── boundingBoxSchema ─────────────────────────────────────────────────────────

describe('boundingBoxSchema', () => {
  it('accepts a valid bounding box', () => {
    expect(boundingBoxSchema().parse([0, 0, 1, 1])).toEqual([0, 0, 1, 1]);
  });

  it('accepts equal min and max (degenerate box)', () => {
    expect(boundingBoxSchema().parse([5, 5, 5, 5])).toEqual([5, 5, 5, 5]);
  });

  it('accepts negative coordinates', () => {
    expect(boundingBoxSchema().parse([-10, -10, 10, 10])).toEqual([-10, -10, 10, 10]);
  });

  it('rejects when minX > maxX', () => {
    expect(boundingBoxSchema().safeParse([1, 0, 0, 1]).success).toBe(false);
  });

  it('rejects when minY > maxY', () => {
    expect(boundingBoxSchema().safeParse([0, 1, 1, 0]).success).toBe(false);
  });

  it('rejects non-finite values', () => {
    expect(boundingBoxSchema().safeParse([0, 0, Infinity, 1]).success).toBe(false);
  });

  it('rejects tuples with wrong length', () => {
    expect(boundingBoxSchema().safeParse([0, 0, 1]).success).toBe(false);
  });
});

// ─── withDefault ───────────────────────────────────────────────────────────────

describe('withDefault', () => {
  it('applies the default when value is missing', () => {
    const schema = z.object({ name: withDefault(z.string(), 'untitled') });
    expect(schema.parse({})).toEqual({ name: 'untitled' });
  });

  it('does not override a provided value', () => {
    const schema = z.object({ name: withDefault(z.string(), 'untitled') });
    expect(schema.parse({ name: 'my-layer' })).toEqual({ name: 'my-layer' });
  });

  it('works with a number schema', () => {
    const schema = withDefault(z.number(), 42);
    expect(schema.parse(undefined)).toBe(42);
  });

  it('works with a boolean schema', () => {
    const schema = withDefault(z.boolean(), false);
    expect(schema.parse(undefined)).toBe(false);
  });
});
