# DT-Logics

> Project rules, code standards, testing conventions, documentation structure, and demo-site readiness.

---

## Overview

This document defines the **rules every contributor must follow**.  
It covers what this project is and is not, code structure, test requirements, documentation expectations, and how the codebase should be shaped so that a documentation website can be generated from it.

---

## What This Project Is

- A collection of **pure TypeScript functions and types**.
- Functions operate on plain data objects (numbers, strings, arrays of numbers, structured objects).
- Everything is isomorphic — works in Node.js and browser without modification.
- The codebase is the source of truth for both runtime behavior and documentation.

## What This Project Is Not

- No DOM manipulation.
- No HTML or CSS.
- No React, Vue, or any UI framework.
- No canvas rendering, WebGL, or painting.
- No event emitters or observable streams.
- No class-based OOP (prefer plain functions and plain objects).

---

## Code Rules

### 1. Functions Only, No Classes

```ts
// ❌ Avoid
class ArtboardManager {
  create(input: CreateArtboardInput) { ... }
}

// ✅ Prefer
function createArtboard(input: CreateArtboardInput): Result<Artboard> { ... }
```

Exception: a lightweight registry or plugin container may use a class if state is required — but it must be clearly justified and documented.

### 2. Pure Functions

A function is pure if:
- It does not read or write global state.
- It does not produce side effects (no console.log in production, no file I/O, no network).
- Given the same input, it always returns the same output.

Every function in `src/` must be pure.

### 3. Immutability

Never mutate input arguments.

```ts
// ❌ Mutates input
function moveArtboard(artboard: Artboard, delta: Point): Artboard {
  artboard.origin.x += delta.x; // mutation!
  return artboard;
}

// ✅ Returns a new object
function moveArtboard(artboard: Artboard, delta: Point): Artboard {
  return {
    ...artboard,
    origin: {
      x: artboard.origin.x + delta.x,
      y: artboard.origin.y + delta.y,
    },
  };
}
```

### 4. No `any`

TypeScript's `strict` mode is always enabled.  
`any` is only permitted inside function bodies when casting to a real Zod type for schema operations (see **DT-Zod**).  
It must never appear in a function signature or a type definition.

### 5. Single-Object Input

All functions with more than one logical argument receive a **single input object**.  
See **DT-Inputs-and-Outputs** for details.

### 6. Result Union, No Throws

All functions that can fail return `Result<T>`.  
See **DT-Inputs-and-Outputs** for the `Result<T>` definition.

---

## Testing

### Framework

All tests use **Vitest**.

```bash
pnpm test        # run all tests once
pnpm test:watch  # watch mode
pnpm coverage    # coverage report
```

### Test File Location

Tests live alongside source files in a `tests/` directory per package:

```
packages/artboard/
  src/
    createArtboard.ts
  tests/
    createArtboard.test.ts
```

### Test File Convention

```ts
import { describe, it, expect } from "vitest";
import { createArtboard } from "../src/createArtboard";

describe("createArtboard", () => {
  it("returns a normalized artboard for a standard drag", () => {
    const result = createArtboard({
      startPoint: { x: 100, y: 100 },
      endPoint: { x: 400, y: 300 },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.origin).toEqual({ x: 100, y: 100 });
    expect(result.data.size).toEqual({ width: 300, height: 200 });
  });

  it("normalizes origin when drag is bottom-right to top-left", () => {
    const result = createArtboard({
      startPoint: { x: 400, y: 300 },
      endPoint: { x: 100, y: 100 },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.origin).toEqual({ x: 100, y: 100 });
  });

  it("returns failure when result is smaller than minSize", () => {
    const result = createArtboard({
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0.5, y: 0.5 },
      minSize: 1,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("too-small");
  });
});
```

### Coverage Requirements

Every exported function must have tests covering:

- The happy path (valid input, expected output).
- Edge cases (zero, negative, boundary values).
- All failure modes (each `error.code` value).
- Reversibility (if a reverse function exists, `reverse(forward(x))` must equal `x`).

---

## Documentation

### `help.md` Per Package

Every package has a `help.md` file at its root.

Required sections:

```md
# Package Name

## Overview
One paragraph. What does this package do? When would you use it?

## Installation
npm install command.

## Functions

### functionName
Description.

**Input**
Table of fields with type, required/optional, default, and description.

**Output**
Description of the return value.

**Example**
Working TypeScript code block.

## Types
List of all exported types with field tables.

## Errors
List of all possible error codes with descriptions.
```

### JSDoc

Every exported function, type, and field must have JSDoc.  
Minimum requirements:

```ts
/**
 * One-line summary.
 *
 * Longer description if needed.
 *
 * @param input - What the input object contains.
 * @returns A Result<T> — success with data or failure with error code.
 *
 * @example
 * const result = functionName({ field: value });
 */
```

### `README.md` Per Package

The `README.md` is a concise version of `help.md` formatted for npm/GitHub display.  
It must include: overview, install command, quick-start example, and a link to `help.md`.

### `CHANGELOG.md`

Every user-visible change must be logged under the correct semver heading.

```md
## [0.2.0] - 2025-01-15

### Added
- `snapArtboardToGrid` function

### Changed
- `createArtboard` now accepts `minSize` option

### Fixed
- Normalized origin when start and end X coordinates are equal
```

---

## Website-Ready Code Structure

The codebase is structured so that a documentation website can be generated from it with minimal extra tooling.

### What the website generator needs

Every `help.md` follows the exact same section structure (see above).  
JSDoc comments are machine-readable with `typedoc` or `ts-morph`.  
All example code blocks are valid TypeScript.  
Every function's input/output is a plain JSON-serializable object — examples can be run in a browser sandbox.

### Suggested website stack (not part of this project)

- **Astro** or **Nextra** for static site generation
- **Shiki** for code highlighting
- **TypeDoc** for auto-generated API reference from JSDoc
- Live examples using a browser-side TypeScript sandbox (e.g., **TS Playground embed** or **Sandpack**)

---

## Linting and Formatting

- **TypeScript strict mode**: always enabled.
- **ESLint**: `@typescript-eslint/recommended` ruleset.
- **Prettier**: default config, enforced in CI.
- **No barrel re-exports of types with Zod**: see **DT-Zod**.

---

## CI Checklist

Every pull request must pass:

- [ ] `pnpm -r lint` — TypeScript type check, zero errors
- [ ] `pnpm -r test` — all tests pass
- [ ] `pnpm -r build` — all packages build cleanly
- [ ] `pnpm -r check-zod` — no Zod imports in dist declaration files
- [ ] All new public functions have JSDoc
- [ ] `help.md` updated if API changed
- [ ] `CHANGELOG.md` entry added
