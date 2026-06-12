# @komeilm76/km-shared

Foundation package for the **km-geoboard** suite — the `Result<T>` discriminated union that every `km-*` package uses as its standard return type for fallible operations, plus reusable Zod v4 schema factories and IDE-safe structural Zod types.

No DOM, no I/O, no side effects. Works in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-shared zod
# or
pnpm add @komeilm76/km-shared zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import type { Result } from '@komeilm76/km-shared';
import { nonEmptyString, positiveNumber, pointSchema } from '@komeilm76/km-shared';

// 1. Use Result<T> as the return type of any fallible function
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: { code: 'divide-by-zero', message: 'Cannot divide by zero' } };
  }
  return { success: true, data: a / b };
}

const r = divide(10, 2);
if (r.success) console.log(r.data); // 5
else console.error(r.error.code, r.error.message);

// 2. Build Zod schemas from the shared factories
const NameSchema = nonEmptyString();      // trimmed, min length 1
const WidthSchema = positiveNumber();     // > 0
const OriginSchema = pointSchema();       // { x: finite, y: finite }

OriginSchema.parse({ x: 10, y: 20 }); // ok
```

## Types

### `Result<T>`

The canonical discriminated union for fallible operations. Check `success` before touching `data`:

```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ResultError };
```

### `ResultError`

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | `string` | yes | Machine-readable, kebab-case (e.g. `"invalid-input"`) |
| `message` | `string` | yes | Human-readable explanation |
| `field` | `string` | no | The input field that caused the failure |

### Structural Zod types — `$SchemaOf<T>`, `$AnyZodType`, `$AnyZodObject`, `$ParseResult`

Structural stand-ins for Zod types, used in exported function signatures so that **published `.d.ts` files never import Zod**. (Zod's deeply recursive types can hang the TypeScript language server when they leak into declaration files.) You normally don't construct these yourself — the schema factories below return them.

```ts
import type { $SchemaOf } from '@komeilm76/km-shared';

// A schema typed structurally — behaves like a Zod schema, but the type
// carries no Zod import.
declare const schema: $SchemaOf<{ x: number; y: number }>;
const parsed = schema.parse({ x: 1, y: 2 }); // typed as { x: number; y: number }
```

## Zod schema factories

All are **factory functions** — call them to get a fresh, independent schema instance.

### Strings

| Function | Returns | Accepts | Rejects |
|---|---|---|---|
| `nonEmptyString()` | `$SchemaOf<string>` | `"hello"` | `""`, `"   "` (empty after trim) |
| `uuid()` | `$SchemaOf<string>` | `"550e8400-e29b-41d4-a716-446655440000"` | `"not-a-uuid"` |
| `colorHexSchema()` | `$SchemaOf<string>` | `"#f00"`, `"#ff0000"` | `"red"`, `"#ff00"` |

### Numbers

| Function | Returns | Accepts | Rejects |
|---|---|---|---|
| `positiveNumber()` | `$SchemaOf<number>` | `1`, `0.5` | `0`, `-1` |
| `nonNegativeNumber()` | `$SchemaOf<number>` | `0`, `7` | `-1` |
| `finiteNumber()` | `$SchemaOf<number>` | `0`, `-1.5` | `NaN`, `Infinity` |
| `unixTimestampMs()` | `$SchemaOf<number>` | `0`, `Date.now()` | `-1`, `1.5` |
| `percentSchema()` | `$SchemaOf<number>` | `0` … `100` | `101`, `-1` |
| `opacitySchema()` | `$SchemaOf<number>` | `0` … `1` | `1.1`, `-0.1` |

### Objects & tuples

| Function | Returns | Validates |
|---|---|---|
| `pointSchema()` | `$SchemaOf<{ x: number; y: number }>` | both axes finite |
| `latLngSchema()` | `$SchemaOf<{ lat: number; lng: number }>` | lat −90…90, lng −180…180 |
| `boundingBoxSchema()` | `$SchemaOf<[number, number, number, number]>` | `[minX, minY, maxX, maxY]`, min ≤ max |

### Generic utilities

```ts
import { z } from 'zod';
import { withDefault } from '@komeilm76/km-shared';

// Wraps any schema with a default value, without leaking Zod into your .d.ts
const NameWithDefault = withDefault(z.string(), 'untitled');
NameWithDefault.parse(undefined); // "untitled"
```

## Example — building your own schema file

```ts
// schemas.ts of a downstream package
import { z } from 'zod';
import { nonEmptyString, positiveNumber, pointSchema, unixTimestampMs } from '@komeilm76/km-shared';

export const FrameSchema = z.object({
  id: z.string(),
  name: nonEmptyString() as unknown as z.ZodType<string>, // cast back for chaining
  origin: pointSchema() as unknown as z.ZodType<{ x: number; y: number }>,
  width: positiveNumber() as unknown as z.ZodType<number>,
  createdAt: unixTimestampMs() as unknown as z.ZodType<number>,
});
```

> Keep type definitions (`types.ts`) and Zod schemas (`schemas.ts`) in separate files so type-only imports never pull Zod into your declaration output.

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — everything under one import |
| [`@komeilm76/km-artboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-artboard) | Artboard geometry (uses `Result` + these factories) |
| [`@komeilm76/km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) | GeoJSON types and validation |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-shared/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
