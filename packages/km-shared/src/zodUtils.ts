/**
 * Reusable Zod v4 schema factory functions.
 *
 * Import these in any package's `schemas.ts` to avoid reinventing common
 * constraints. Do NOT import this file in `types.ts` — keep types and schemas
 * separate so Zod never leaks into declaration files via type imports.
 *
 * All functions are factories (called with `()`) to ensure each call returns
 * an independent schema instance that can be extended or refined independently.
 */

import { z } from 'zod';
import type { $AnyZodType, $SchemaOf } from './zodStructural';

// ─── String schemas ────────────────────────────────────────────────────────────

/**
 * A Zod string that must be non-empty after trimming whitespace.
 *
 * @example
 * nonEmptyString().parse("hello")  // "hello"
 * nonEmptyString().parse("  ")     // throws — empty after trim
 */
export function nonEmptyString(): $SchemaOf<string> {
  return z.string().trim().min(1) as unknown as $SchemaOf<string>;
}

/**
 * A Zod string validated as UUID v4.
 *
 * @example
 * uuid().parse("550e8400-e29b-41d4-a716-446655440000") // valid
 * uuid().parse("not-a-uuid") // throws
 */
export function uuid(): $SchemaOf<string> {
  return z.string().uuid() as unknown as $SchemaOf<string>;
}

/**
 * Zod schema for a CSS hex color string.
 * Accepts 3-digit (#RGB) and 6-digit (#RRGGBB) formats.
 *
 * @example
 * colorHexSchema().parse("#ff0000") // "#ff0000"
 * colorHexSchema().parse("#f00")    // "#f00"
 * colorHexSchema().parse("red")     // throws
 */
export function colorHexSchema(): $SchemaOf<string> {
  return z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) as unknown as $SchemaOf<string>;
}

// ─── Number schemas ────────────────────────────────────────────────────────────

/**
 * A Zod number that must be strictly positive (> 0).
 *
 * @example
 * positiveNumber().parse(1)    // 1
 * positiveNumber().parse(0)    // throws
 * positiveNumber().parse(-1)   // throws
 */
export function positiveNumber(): $SchemaOf<number> {
  return z.number().positive() as unknown as $SchemaOf<number>;
}

/**
 * A Zod number that must be >= 0 (zero is allowed).
 *
 * @example
 * nonNegativeNumber().parse(0)   // 0
 * nonNegativeNumber().parse(-1)  // throws
 */
export function nonNegativeNumber(): $SchemaOf<number> {
  return z.number().min(0) as unknown as $SchemaOf<number>;
}

/**
 * A Zod number that must be finite (not NaN, Infinity, or -Infinity).
 *
 * @example
 * finiteNumber().parse(0)         // 0
 * finiteNumber().parse(-1.5)      // -1.5
 * finiteNumber().parse(Infinity)  // throws
 * finiteNumber().parse(NaN)       // throws
 */
export function finiteNumber(): $SchemaOf<number> {
  return z.number().finite() as unknown as $SchemaOf<number>;
}

/**
 * A Zod number representing a Unix timestamp in milliseconds.
 * Must be a non-negative safe integer.
 *
 * @example
 * unixTimestampMs().parse(0)           // 0
 * unixTimestampMs().parse(Date.now())  // current timestamp
 * unixTimestampMs().parse(-1)          // throws
 */
export function unixTimestampMs(): $SchemaOf<number> {
  return z.number().int().min(0).safe() as unknown as $SchemaOf<number>;
}

/**
 * Zod schema for a percentage value (0–100 inclusive).
 *
 * @example
 * percentSchema().parse(0)    // 0
 * percentSchema().parse(100)  // 100
 * percentSchema().parse(101)  // throws
 */
export function percentSchema(): $SchemaOf<number> {
  return z.number().min(0).max(100) as unknown as $SchemaOf<number>;
}

/**
 * Zod schema for an opacity value (0.0–1.0 inclusive).
 *
 * @example
 * opacitySchema().parse(0)    // 0
 * opacitySchema().parse(1)    // 1
 * opacitySchema().parse(0.5)  // 0.5
 * opacitySchema().parse(1.1)  // throws
 */
export function opacitySchema(): $SchemaOf<number> {
  return z.number().min(0).max(1) as unknown as $SchemaOf<number>;
}

// ─── Object / tuple schemas ────────────────────────────────────────────────────

/**
 * Zod schema for a 2D canvas point `{ x, y }`.
 * Both x and y must be finite numbers.
 *
 * @example
 * pointSchema().parse({ x: 0, y: -5 })    // { x: 0, y: -5 }
 * pointSchema().parse({ x: NaN, y: 0 })   // throws
 */
export function pointSchema(): $SchemaOf<{ x: number; y: number }> {
  return z.object({
    x: z.number().finite(),
    y: z.number().finite(),
  }) as unknown as $SchemaOf<{ x: number; y: number }>;
}

/**
 * Zod schema for a geographic coordinate `{ lat, lng }`.
 * lat: -90 to 90, lng: -180 to 180.
 *
 * @example
 * latLngSchema().parse({ lat: 0, lng: 0 })    // valid
 * latLngSchema().parse({ lat: 91, lng: 0 })   // throws — lat out of range
 */
export function latLngSchema(): $SchemaOf<{ lat: number; lng: number }> {
  return z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }) as unknown as $SchemaOf<{ lat: number; lng: number }>;
}

/**
 * Zod schema for a bounding box tuple `[minX, minY, maxX, maxY]`.
 * Validates that minX ≤ maxX and minY ≤ maxY.
 *
 * @example
 * boundingBoxSchema().parse([0, 0, 1, 1])   // valid
 * boundingBoxSchema().parse([1, 0, 0, 1])   // throws — minX > maxX
 */
export function boundingBoxSchema(): $SchemaOf<[number, number, number, number]> {
  const finite = z.number().finite();
  return z
    .tuple([finite, finite, finite, finite])
    .refine(([minX, minY, maxX, maxY]) => minX <= maxX && minY <= maxY, {
      message: 'Bounding box min values must be <= max values',
    }) as unknown as $SchemaOf<[number, number, number, number]>;
}

// ─── Generic utilities ─────────────────────────────────────────────────────────

/**
 * Wraps any schema with a default value.
 * Equivalent to `schema.default(value)` but makes the default explicit at the
 * call site and is safe to use in exported function signatures (uses structural
 * types — see zod_hang.md).
 *
 * @param schema - Any Zod schema (uses structural `$AnyZodType` constraint).
 * @param value  - The default value. Must match the schema's output type.
 * @returns The same schema with a default applied.
 *
 * @example
 * withDefault(z.string(), "untitled")
 * withDefault(z.number(), 0)
 */
export function withDefault<S extends $AnyZodType>(
  schema: S,
  value: S['_zod']['output'],
): S {
  // Cast to ZodTypeAny inside the body — never leaks to .d.ts
  const _s = schema as unknown as z.ZodTypeAny;
  return _s.default(value) as unknown as S;
}
