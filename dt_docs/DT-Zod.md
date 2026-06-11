# DT-Zod

> Zod v4 usage rules, schema conventions, custom utilities, and IDE-safe library patterns.

---

## Overview

All runtime type validation in this project uses **Zod v4.4.x**.  
Zod schemas serve as the single source of truth for validating data at function boundaries, parsing external formats (GeoJSON, SVG attributes, OpenLayers), and generating structured error messages.

This document covers:
- Schema file organization
- Naming conventions
- `safeParse` usage pattern
- Custom Zod utility functions (helpers for building reusable schemas)
- IDE-safe library export rules (critical — read before publishing)

---

## Version

```json
{
  "peerDependencies": {
    "zod": ">=4.4.0"
  },
  "devDependencies": {
    "zod": "^4.4.0"
  }
}
```

Zod must always be a **`peerDependency`**, not a `dependency`.  
See the **IDE-Safe Library Rules** section below.

---

## Schema Organization

Each package has a dedicated `schemas.ts` file.  
Schemas are **never** placed in `types.ts` — types and schemas are always separate files.

```
packages/artboard/src/
  types.ts      ← TypeScript types only (no Zod imports)
  schemas.ts    ← Zod schemas only
  index.ts      ← Public re-exports
```

Schema names always match their type name with a `Schema` suffix:

```ts
// types.ts
type Point = { x: number; y: number };

// schemas.ts
import { z } from "zod";
const PointSchema = z.object({ x: z.number(), y: z.number() });
```

---

## Naming Convention

| Type | Schema |
|---|---|
| `Point` | `PointSchema` |
| `Artboard` | `ArtboardSchema` |
| `CreateArtboardInput` | `CreateArtboardInputSchema` |
| `GeoJsonFeature` | `GeoJsonFeatureSchema` |

Schemas are **not exported** from the package's public `index.ts` unless the consumer explicitly needs to validate data against them.  
If exported, they must follow the IDE-safe rules below.

---

## `safeParse` Usage Pattern

**Never use `.parse()` at function boundaries.** Always use `.safeParse()`.

```ts
// ❌ Throws on invalid input — breaks the Result<T> contract
const data = PointSchema.parse(rawInput);

// ✅ Returns a result union
const parsed = PointSchema.safeParse(rawInput);
if (!parsed.success) {
  return { success: false, error: { code: "invalid-input", message: parsed.error.message } };
}
const point = parsed.data;
```

`.parse()` is permitted inside tests when you are sure the input is valid,  
or inside internal helpers that are not part of the public API.

---

## Standard Schema Utilities

These utility functions are defined once in `packages/shared/src/zodUtils.ts` and reused across all packages.

---

### `nonEmptyString`

A string that is not empty after trimming.

```ts
/**
 * A Zod string that must be non-empty after trimming whitespace.
 * @example nonEmptyString() // z.string().trim().min(1)
 */
function nonEmptyString() {
  return z.string().trim().min(1);
}
```

---

### `positiveNumber`

A number strictly greater than zero.

```ts
/**
 * A Zod number that must be strictly positive (> 0).
 * @example positiveNumber() // z.number().positive()
 */
function positiveNumber() {
  return z.number().positive();
}
```

---

### `nonNegativeNumber`

A number ≥ 0 (zero is allowed).

```ts
/**
 * A Zod number that must be >= 0.
 * @example nonNegativeNumber()
 */
function nonNegativeNumber() {
  return z.number().min(0);
}
```

---

### `finiteNumber`

A number that is neither `Infinity`, `-Infinity`, nor `NaN`.

```ts
/**
 * A Zod number that must be finite (not NaN or Infinity).
 */
function finiteNumber() {
  return z.number().finite();
}
```

---

### `uuid`

A valid UUID v4 string.

```ts
/**
 * A Zod string validated as UUID v4.
 */
function uuid() {
  return z.string().uuid();
}
```

---

### `unixTimestampMs`

A Unix timestamp in milliseconds (positive integer).

```ts
/**
 * A Zod number representing a Unix timestamp in milliseconds.
 * Must be a non-negative safe integer.
 */
function unixTimestampMs() {
  return z.number().int().min(0).safe();
}
```

---

### `pointSchema`

Reusable 2D point schema.

```ts
/**
 * Zod schema for a 2D canvas point { x, y }.
 * Both x and y must be finite numbers.
 */
function pointSchema() {
  return z.object({
    x: finiteNumber(),
    y: finiteNumber(),
  });
}
```

---

### `latLngSchema`

Geographic coordinate schema.

```ts
/**
 * Zod schema for a geographic coordinate { lat, lng }.
 * lat: -90 to 90, lng: -180 to 180.
 */
function latLngSchema() {
  return z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  });
}
```

---

### `colorHexSchema`

A CSS hex color string.

```ts
/**
 * Zod schema for a CSS hex color string.
 * Accepts 3-digit (#RGB) and 6-digit (#RRGGBB) formats.
 * @example "#ff0000", "#f00"
 */
function colorHexSchema() {
  return z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
}
```

---

### `percentSchema`

A number from 0 to 100.

```ts
/**
 * Zod schema for a percentage value (0–100 inclusive).
 */
function percentSchema() {
  return z.number().min(0).max(100);
}
```

---

### `opacitySchema`

A number from 0.0 to 1.0.

```ts
/**
 * Zod schema for an opacity value (0.0–1.0 inclusive).
 */
function opacitySchema() {
  return z.number().min(0).max(1);
}
```

---

### `boundingBoxSchema`

A rectangular bounding box as `[minX, minY, maxX, maxY]`.

```ts
/**
 * Zod schema for a bounding box tuple [minX, minY, maxX, maxY].
 * Validates that min <= max on each axis.
 */
function boundingBoxSchema() {
  return z
    .tuple([finiteNumber(), finiteNumber(), finiteNumber(), finiteNumber()])
    .refine(([minX, minY, maxX, maxY]) => minX <= maxX && minY <= maxY, {
      message: "Bounding box min values must be <= max values",
    });
}
```

---

### `withDefault<T>`

Wraps a schema with a default value and adds a JSDoc hint.

```ts
/**
 * Wraps a schema with a default value.
 * Equivalent to schema.default(value) but makes the default explicit at call site.
 *
 * @param schema - The Zod schema to wrap.
 * @param value  - The default value to apply.
 */
function withDefault<T>(schema: z.ZodType<T>, value: T) {
  return schema.default(value);
}
```

---

## IDE-Safe Library Rules

Because this project is published as an npm package, Zod types must **never appear in generated `.d.ts` declaration files**.  
If they do, every consumer's IDE will freeze on import (see `zod_hang.md` in the project root for the full explanation).

### The Two Local Structural Types

Define these once in `packages/shared/src/zodStructural.ts`:

```ts
/**
 * Local structural substitute for z.ZodObject<any>.
 * Use as a generic constraint in all exported functions.
 * Never import from 'zod' in exported signatures.
 *
 * Compatible with Zod v4.4.x (_zod internal field).
 */
export type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

/**
 * Local structural substitute for z.ZodTypeAny.
 * Use as a generic constraint in all exported functions.
 */
export type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};
```

### Rules at a Glance

| Location | Rule |
|---|---|
| Exported function generic constraints | Use `$AnyZodObject` or `$AnyZodType`, never `z.ZodObject<any>` |
| Exported function return types | Use `T['_zod']['output']`, never `z.infer<T>` |
| Exported interfaces | Never include a field of type `z.ZodTypeAny` or similar |
| Function bodies | Use real Zod types freely — they never reach `.d.ts` files |
| Cast pattern | `const _s = schema as unknown as z.ZodObject<any>` — inside body only |

### Post-Build Verification

After every build, run:

```bash
grep -rn "^import.*zod" dist/
```

Output must be empty. If any match is found, trace the exported symbol that references a Zod type and replace it with a structural type.

---

## Schema Completeness Requirement

For every type defined in `types.ts`, there must be a corresponding Zod schema in `schemas.ts`.  
The Zod-inferred type must be **identical** to the hand-written type.  
Use `z.infer` inside `schemas.ts` to derive types and compare:

```ts
// schemas.ts
import type { Point } from "./types";

export const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

// This line will produce a TypeScript error if the schema and type diverge
type _PointCheck = z.infer<typeof PointSchema> extends Point
  ? Point extends z.infer<typeof PointSchema>
    ? true
    : never
  : never;
```

---

## File Location

```
packages/
  shared/
    src/
      zodUtils.ts       ← All utility schema factory functions
      zodStructural.ts  ← $AnyZodObject, $AnyZodType
    tests/
      zodUtils.test.ts
    help.md
```
