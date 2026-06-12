# DT-Inputs-and-Outputs

> Design contract for all function signatures — inputs, outputs, reversibility, and data shapes.

---

## Overview

Every function in this project follows a consistent contract for how it receives data and what it returns.  
This document is the canonical reference for that contract.

The goal is **predictability**: any developer reading a function signature should immediately understand what goes in, what comes out, and how to reverse or inspect the transformation.

---

## Input Design

### Primitive Inputs

The simplest inputs are single numbers or booleans.

```ts
function degreesToRadians(degrees: number): number
function radiansToDegrees(radians: number): number
```

### Structured Inputs (Object)

When a function needs more than one argument, it always receives a **single input object** — never multiple positional arguments.

```ts
// ❌ Avoid
function translate(x: number, y: number, dx: number, dy: number): Point

// ✅ Preferred
function translate(input: TranslateInput): Point

type TranslateInput = {
  point: Point;
  delta: Point;
};
```

**Why a single object?**

- Named parameters are self-documenting.
- Easy to extend without breaking callers.
- Easy to validate with Zod `safeParse`.
- Easy to serialize, log, and replay in tests.

### Deep Array Inputs

Many geometry operations operate on arrays — sometimes deeply nested.

```ts
// A polygon ring is an array of points
type Ring = Point[];

// A multi-polygon is an array of arrays of rings
type MultiPolygon = Ring[][];
```

Arrays follow the same rule: always typed, never `any[]`.  
If an array can be empty, that must be documented and handled explicitly.

### Optional Fields with Defaults

Every optional field must have a documented default value via JSDoc.

```ts
type CreateArtboardInput = {
  startPoint: Point;
  endPoint: Point;
  /** @default "Artboard" */
  name?: string;
  /** @default 1 */
  minSize?: number;
};
```

Inside the function, defaults are applied at the top with a single destructure:

```ts
function createArtboard(input: CreateArtboardInput) {
  const { startPoint, endPoint, name = "Artboard", minSize = 1 } = input;
  // ...
}
```

---

## Output Design

### Result Union (never throw)

Functions that can fail return a **discriminated union result**, never throw.

```ts
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: ResultError };

type ResultError = {
  code: string;     // machine-readable, e.g. "too-small", "invalid-input"
  message: string;  // human-readable
  field?: string;   // which input field caused the failure, if known
};
```

**Usage:**

```ts
const result = createArtboard(input);

if (!result.success) {
  console.error(result.error.code); // "too-small"
  return;
}

const artboard = result.data;
```

### Plain Serializable Output

All output objects must be **plain JSON-serializable**.  
No class instances, no `Map`, no `Set`, no `Symbol`, no `Date` objects.  
Use `number` (Unix ms) for timestamps.

```ts
// ❌ Not serializable
type Artboard = {
  createdAt: Date;
};

// ✅ Serializable
type Artboard = {
  createdAt: number; // Unix timestamp ms
};
```

### Output Shape Rules

| Concern | Rule |
|---|---|
| IDs | Always `string` (UUID v4) |
| Timestamps | Always `number` (Unix ms) |
| Coordinates | Always `number` (floating-point canvas units) |
| Enums | Always `string` union literals |
| Nullable fields | Always `T \| null`, never `undefined` in output |
| Optional fields | Allowed on **input** types only; output types are always complete |

---

## Reversibility

Every non-trivial function should have a documented **reverse function**.  
If the reverse is not a separate function, the document must explain how to reconstruct the original input from the output.

### Examples

| Forward | Reverse |
|---|---|
| `artboardToRect(artboard)` | `artboardFromRect(rect)` |
| `pointToGeoCoord(point, meta)` | `geoCoordToPoint(coord, meta)` |
| `svgPathToGeoJson(path, meta)` | `geoJsonToSvgPath(geojson, meta)` |
| `degreesToRadians(deg)` | `radiansToDegrees(rad)` |
| `normalizeBounds(bounds)` | `denormalizeBounds(normalized, original)` |

### What Makes a Function Irreversible?

Some functions are intentionally one-directional:

- **Lossy transformations**: rasterizing a vector shape (SVG → PNG) loses data.
- **Aggregations**: merging multiple artboards into one bounding box.
- **Hashing / IDs**: generating a UUID from metadata.

These functions must be **documented as one-way** with a note explaining what data is lost.

---

## Validation

All inputs that enter a public function boundary are validated using **Zod `safeParse`**.  
See **DT-Zod** for schema conventions.

The validation result is translated into the `Result` union before being returned to the caller.

```ts
function createArtboard(input: CreateArtboardInput): Result<Artboard> {
  const parsed = CreateArtboardInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "invalid-input",
        message: parsed.error.message,
      },
    };
  }
  // work with parsed.data
}
```

---

## JSDoc Convention

Every exported function must have a JSDoc comment with at minimum:

```ts
/**
 * Short one-line description.
 *
 * @param input - Description of the input object.
 * @returns Description of the return value, including the success/failure union.
 *
 * @example
 * const result = createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 100 } });
 * if (result.success) console.log(result.data.size); // { width: 100, height: 100 }
 */
```

Every field in a type that has a default value must annotate it:

```ts
/**
 * @default "Artboard"
 */
name?: string;
```

---

## File Conventions

```
packages/<domain>/src/
  types.ts        ← All input/output types for this domain
  schemas.ts      ← Zod schemas matching each type
  index.ts        ← Public re-exports
```

Types are **separated from implementations**.  
Schemas are **separated from types** (to avoid Zod leaking into declaration files — see DT-Zod).
