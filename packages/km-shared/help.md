# km-shared — API Reference

## Overview

`km-shared` is the foundation package for the km-geoboard monorepo.
It provides the `Result<T>` discriminated union used by every package as the
standard return type for fallible operations, plus Zod v4 utility functions
that all other packages reuse when building their schemas.

## Installation

```bash
pnpm add @komeilm76/km-shared zod
```

Zod must be installed alongside this package (it is a peer dependency).

---

## Types

### `Result<T>`

A discriminated union representing the outcome of a fallible operation.

| Field | Type | Present when |
|-------|------|--------------|
| `success` | `true` | Operation succeeded |
| `data` | `T` | `success === true` |
| `success` | `false` | Operation failed |
| `error` | `ResultError` | `success === false` |

```ts
import type { Result } from '@komeilm76/km-shared';

function parse(raw: unknown): Result<number> {
  const n = Number(raw);
  if (Number.isNaN(n)) {
    return { success: false, error: { code: 'not-a-number', message: 'Input is not a number' } };
  }
  return { success: true, data: n };
}
```

### `ResultError`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | `string` | ✅ | Machine-readable, kebab-case (e.g. `"invalid-input"`) |
| `message` | `string` | ✅ | Human-readable explanation |
| `field` | `string` | ❌ | The input field that caused the failure, when applicable |

---

## Zod Utilities

All functions are factory functions — call them to produce a Zod schema.

### `nonEmptyString()`
Returns a trimmed string schema that rejects empty strings and whitespace-only strings.

### `positiveNumber()`
Returns a number schema that must be strictly greater than zero.

### `nonNegativeNumber()`
Returns a number schema that must be >= 0.

### `finiteNumber()`
Returns a number schema that rejects `NaN`, `Infinity`, and `-Infinity`.

### `uuid()`
Returns a string schema validated as UUID v4.

### `unixTimestampMs()`
Returns a number schema for Unix timestamps in milliseconds (non-negative safe integer).

### `pointSchema()`
Returns an object schema `{ x: number, y: number }` where both must be finite.

### `latLngSchema()`
Returns an object schema `{ lat: number, lng: number }` with geographic bounds.

### `colorHexSchema()`
Returns a string schema for CSS hex colors (`#RGB` or `#RRGGBB`).

### `percentSchema()`
Returns a number schema for values between 0 and 100 inclusive.

### `opacitySchema()`
Returns a number schema for values between 0.0 and 1.0 inclusive.

### `boundingBoxSchema()`
Returns a 4-tuple schema `[minX, minY, maxX, maxY]` with min ≤ max validation.

### `withDefault(schema, value)`
Wraps any schema with a default value.

---

## Structural Types

### `$AnyZodObject`
A local structural substitute for `z.ZodObject<any>`. Use as a generic constraint
in exported function signatures to prevent IDE hangs. See `.planning/zod_hang.md` for details.

### `$AnyZodType`
A local structural substitute for `z.ZodTypeAny`. Same use case.

---

## Examples

```ts
import { nonEmptyString, finiteNumber, pointSchema } from '@komeilm76/km-shared';
import { z } from 'zod';

// Build a schema inside your package's schemas.ts
const LayerSchema = z.object({
  id: z.string().uuid(),
  name: nonEmptyString(),
  origin: pointSchema(),
  opacity: z.number().min(0).max(1),
});
```
