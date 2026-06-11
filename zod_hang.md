# Zod IDE Hang — Complete Guide

> Why publishing a TypeScript library that uses Zod can freeze the IDE on every
> import, what causes it, how to fix it, and every rule you need to prevent it.

---

## Table of Contents

1. [What Is This Problem?](#1-what-is-this-problem)
2. [How TypeScript Processes a Library Import](#2-how-typescript-processes-a-library-import)
3. [Root Causes](#3-root-causes)
   - [Cause 1 — Zod type in a top-level exported constraint (dominant)](#cause-1--zod-type-in-a-top-level-exported-constraint-dominant)
   - [Cause 2 — `dependency` vs. `peerDependency` (secondary)](#cause-2--dependency-vs-peerdependency-secondary)
4. [The Fix](#4-the-fix)
   - [Fix 1 — Local structural types](#fix-1--local-structural-types)
   - [Fix 2 — Declare Zod as a peerDependency](#fix-2--declare-zod-as-a-peerdependency)
5. [Code Examples — Invalid](#5-code-examples--invalid)
6. [Code Examples — Valid](#6-code-examples--valid)
7. [Rules, Conditions, and Limitations](#7-rules-conditions-and-limitations)
8. [How to Verify You Are Clean](#8-how-to-verify-you-are-clean)
9. [Pre-Publish Checklist](#9-pre-publish-checklist)

---

## 1. What Is This Problem?

When you build a TypeScript **library** (an npm package) that uses Zod internally,
you must be careful about one specific thing: **which types end up in your
generated declaration files** (`.d.ts` / `.d.mts`).

If any exported function, interface, or generic constraint references a Zod type
directly — such as `z.ZodObject<any>`, `z.ZodTypeAny`, or `z.infer<T>` — the
TypeScript compiler (`tsc` / `tsup`) will write an `import { z } from 'zod'`
statement at the top of every generated declaration file.

When someone installs your library and writes:

```ts
import myLib from 'your-library';
```

...the TypeScript Language Server (tsserver) finds that declaration file,
sees `import { z } from 'zod'`, and **immediately loads the entire Zod type
system** — over 100 KB of deeply recursive conditional type definitions.

**The symptoms:**

- The IDE freezes for several seconds on every import of your library.
- IntelliSense stops working until the freeze clears.
- The freeze repeats every time the import is re-evaluated — for example, after
  saving any file in the project.
- The problem is invisible to you as the library author, because you always have
  Zod loaded already. Only your consumers experience it.

> **Key insight:** The problem is entirely at the **type level**. Having Zod in
> `dependencies` at runtime is fine and correct. The issue is specifically the
> `import` statement in the generated `.d.ts` files.

---

## 2. How TypeScript Processes a Library Import

Understanding the exact sequence helps clarify why this hangs:

1. Consumer writes `import myLib from 'your-library'`.
2. tsserver reads `package.json` → finds the `exports` or `types` field.
3. tsserver opens the declaration file (e.g., `dist/index.d.ts`).
4. tsserver sees `import { z } from 'zod'` at the top of that file.
5. tsserver opens and fully parses Zod's declaration files from scratch.
6. **This is where the hang occurs.** Zod has ~100 KB of deeply recursive
   conditional types. Parsing and resolving them takes significant time.
7. After Zod finishes loading, tsserver can finally finish evaluating your
   library's exports.
8. Every time tsserver invalidates its cache (file save, project reload), it
   repeats from step 4.

The hang happens **at import time, before the consumer has written a single
line of code using your library.** Just writing the import statement is enough.

---

## 3. Root Causes

There are two independent causes. The first is dominant — it causes the freeze
on its own. The second makes it worse by removing tsserver's ability to reuse a
cached copy of Zod.

---

### Cause 1 — Zod type in a top-level exported constraint (dominant)

TypeScript evaluates the generic constraints of every exported function the
moment it processes the declaration file. If that constraint is a raw Zod type
using `any`:

```ts
// What ends up in your .d.ts file:
declare function withSchema<S extends z.ZodObject<any>>(schema: S): ...
```

TypeScript must fully expand `z.ZodObject<any>` right then. The `any` type
parameter is the critical part — it **prevents TypeScript from short-circuiting**
and forces it to walk every recursive branch of Zod's conditional type tree.

**Zod types that trigger this when used as top-level constraints:**

| Zod type | Severity |
|---|---|
| `z.ZodObject<any>` | Most severe — recursive expansion with `any` |
| `z.ZodTypeAny` | Severe — alias for `ZodType<any, any, any>` |
| `z.ZodType<any>` | Severe — same expansion |
| `z.infer<T>` where T is unconstrained | Severe — deferred but still forces Zod load |
| `AnyZodObject` (Zod's own alias) | Severe — same as `ZodObject<any>` |

**Why Zod types nested deeper are different:**

If a Zod type appears only inside a **return-type property** (not as the
top-level constraint), TypeScript evaluates it **lazily** — only when the
consumer actually calls that specific method. By that time, the consumer's own
`import { z } from 'zod'` has already been processed, so Zod is already loaded
and cached. No hang occurs.

```ts
// Top-level constraint: plain interface → resolved instantly ✅
// z.infer inside a property → evaluated lazily ✅
declare function makeConfig<C extends IMyConfig>(config: C): C & {
  validate: <T extends z.infer<z.ZodObject<any>>>(data: T) => T;
};
```

---

### Cause 2 — `dependency` vs. `peerDependency` (secondary)

| | Zod as `dependency` | Zod as `peerDependency` |
|---|---|---|
| Where npm installs Zod | May be at `node_modules/your-lib/node_modules/zod/` | Always at `node_modules/zod/` |
| Path TypeScript resolves `'zod'` from | A potentially different, nested path | The consumer's own path |
| tsserver cache hit? | **No** — different path = must re-parse entirely | **Yes** — same path = already cached |

When Zod is a `dependency`, npm may install a separate nested copy of Zod inside
your library's `node_modules`. That copy sits at a **different absolute file
path** than the consumer's own Zod. tsserver treats these as different modules
and must parse the entire Zod type system twice — once for the consumer's Zod,
and once for your library's Zod.

When Zod is a `peerDependency`, npm does not install its own copy. TypeScript
resolves `'zod'` to the consumer's installation — the same path tsserver has
already parsed and cached. Zero extra work.

---

## 4. The Fix

---

### Fix 1 — Local structural types

The core solution: **never let a Zod type appear in an exported signature.**
Replace every Zod type in exported parameter types, return types, and generic
constraints with a minimal **local structural type** that you define yourself.

These types work because TypeScript uses **structural typing** — a value is
compatible with a type if its shape matches, regardless of where the type came
from. A real Zod schema will always satisfy these local structural types.

#### Structural type for `z.ZodObject<any>`

```ts
// Define this once, near the top of your main source file.
// Never import it from 'zod'. It lives only in your library.
type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};
```

Use it as the constraint in exported functions:

```ts
// The .d.ts file will say: <S extends $AnyZodObject>
// No Zod import needed. TypeScript resolves $AnyZodObject instantly.
export function withSchema<S extends $AnyZodObject>(schema: S) {
  // Inside the body, cast to the real Zod type freely.
  // This cast is erased at compile time and never reaches .d.ts files.
  const _s = schema as unknown as z.ZodObject<any>;
  return _s.parse({});
}
```

#### Structural type for `z.ZodTypeAny`

```ts
type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};
```

#### `T['_zod']['output']` instead of `z.infer<T>`

In exported return types, replace `z.infer<T>` with `T['_zod']['output']`:

```ts
// ❌ Forces Zod into the .d.ts signature
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T>

// ✅ Identical inference for the consumer, zero Zod in the .d.ts signature
export function parse<T extends $AnyZodType>(schema: T, data: unknown): T['_zod']['output']
```

**Why they are equivalent:**
In Zod v4, `z.infer<T>` is defined as `T extends { _zod: { output: any } } ? T['_zod']['output'] : never`.
Using `T['_zod']['output']` directly skips that conditional check entirely and
produces the same inferred type — but requires zero knowledge of Zod's internals
to evaluate.

---

### Fix 2 — Declare Zod as a peerDependency

```json
{
  "peerDependencies": {
    "zod": ">=4.0.0"
  },
  "devDependencies": {
    "zod": "^4.0.0"
  }
}
```

`devDependencies` ensures Zod is available while you develop and test. 
`peerDependencies` tells npm: "the consumer must provide this." No nested copy
is installed. TypeScript resolves `'zod'` to the consumer's installation — which
is already cached in tsserver.

---

## 5. Code Examples — Invalid

Every example below will cause tsserver to freeze on consumer import.

---

### ❌ `z.ZodObject<any>` as a top-level generic constraint

```ts
import { z } from 'zod';

// The generated .d.ts will contain: import { z } from 'zod'
// TypeScript expands ZodObject<any> fully on every consumer import.
export function withSchema<S extends z.ZodObject<any>>(schema: S) {
  return schema.parse({});
}
```

---

### ❌ `z.ZodTypeAny` as a top-level generic constraint

```ts
import { z } from 'zod';

// Same problem — ZodTypeAny is ZodType<any, any, any>.
export function validate<T extends z.ZodTypeAny>(schema: T, value: unknown): boolean {
  return schema.safeParse(value).success;
}
```

---

### ❌ `z.infer<T>` in a return type with an unconstrained T

```ts
import { z } from 'zod';

// z.infer<T> forces the Zod type into the top-level signature.
export function safeParse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}
```

---

### ❌ `AnyZodObject` (Zod's built-in alias) as a constraint

```ts
import { z, AnyZodObject } from 'zod';

// AnyZodObject is just ZodObject<any> renamed — same expansion, same hang.
export function register<S extends AnyZodObject>(schema: S, name: string) {
  return { schema, name };
}
```

---

### ❌ Re-exporting a Zod type from the library's public API

```ts
import { z } from 'zod';

// This puts a Zod type directly into the .d.ts as a top-level export.
// Any consumer who imports from this library will trigger Zod's full load.
export type SchemaType = z.ZodObject<{ id: z.ZodString; name: z.ZodString }>;
```

---

### ❌ Zod type in an exported interface field

```ts
import { z } from 'zod';

// The interface is exported. The field type is a Zod type.
// tsc writes the Zod import into the .d.ts to describe this interface.
export interface FieldConfig {
  schema: z.ZodTypeAny;
  label: string;
}
```

---

### ❌ Partial fix — only fixing the return type but not the constraint

```ts
import { z } from 'zod';

type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

// ✅ Return type is fixed
// ❌ Constraint is still z.ZodObject<any> — still causes the hang
export function withSchema<S extends z.ZodObject<any>>(
  schema: S
): S['_zod']['output'] {
  return (schema as unknown as z.ZodObject<any>).parse({});
}
```

**Both the constraint AND the return type must be clean.**

---

## 6. Code Examples — Valid

Every example below will produce a `.d.ts` file with **zero Zod imports**.

---

### ✅ Local structural type as constraint — basic pattern

```ts
import { z } from 'zod'; // Runtime only — erased from .d.ts

type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

// .d.ts will contain: <S extends $AnyZodObject>
// No 'zod' import in the declaration file.
export function withSchema<S extends $AnyZodObject>(schema: S) {
  const _s = schema as unknown as z.ZodObject<any>;
  return _s.parse({});
}
```

---

### ✅ `T['_zod']['output']` in the return type

```ts
import { z } from 'zod';

type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};

// Consumer sees: safeParse<T extends $AnyZodType>(schema: T, data: unknown): T['_zod']['output'] | undefined
// Identical inference to z.infer<T>. Zero Zod in the declaration.
export function safeParse<T extends $AnyZodType>(
  schema: T,
  data: unknown
): T['_zod']['output'] | undefined {
  const _s = schema as unknown as z.ZodTypeAny;
  const result = _s.safeParse(data);
  return result.success ? result.data : undefined;
}
```

---

### ✅ Exported interface using structural types throughout

```ts
import { z } from 'zod';

type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

// The exported interface references only $AnyZodObject and standard types.
// No Zod in the .d.ts.
export interface SchemaRegistry<S extends $AnyZodObject> {
  schema: S;
  validate(data: unknown): S['_zod']['output'] | undefined;
  key: string;
}

export function createRegistry<S extends $AnyZodObject>(
  schema: S,
  key: string
): SchemaRegistry<S> {
  const _s = schema as unknown as z.ZodObject<any>;
  return {
    schema,
    key,
    validate(data) {
      const result = _s.safeParse(data);
      return result.success ? result.data : undefined;
    },
  };
}
```

---

### ✅ Zod types nested in return-type properties (lazy — acceptable)

```ts
import { z } from 'zod';

interface IBaseConfig {
  endpoint: string;
  method: 'GET' | 'POST';
}

// Top-level constraint: plain interface — resolved instantly.
// Zod types are nested inside return-type properties — evaluated lazily,
// only when the consumer calls .parseBody() or .parseResponse().
export function defineRoute<C extends IBaseConfig>(config: C): C & {
  parseBody: <T extends z.ZodTypeAny>(schema: T) => (data: unknown) => z.infer<T> | undefined;
  parseResponse: <T extends z.ZodTypeAny>(schema: T) => (raw: unknown) => z.infer<T>;
} {
  return {
    ...config,
    parseBody: (schema) => (data) => {
      const r = schema.safeParse(data);
      return r.success ? r.data : undefined;
    },
    parseResponse: (schema) => (raw) => schema.parse(raw),
  };
}
```

> **Note:** This still puts Zod into the `.d.ts` file. It is safe because the
> constraint is plain. But the structural-type approach (no Zod anywhere in
> the `.d.ts`) is always preferable.

---

### ✅ Complete clean library — full production pattern

```ts
import { z } from 'zod'; // Runtime only

// ─── Local structural types ───────────────────────────────────────────────────
// These live only in this file. They are never imported from 'zod'.
// They satisfy TypeScript's structural checker for any real Zod schema.

type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};

// ─── Public types ─────────────────────────────────────────────────────────────
// These use only $AnyZodObject / standard TypeScript. No Zod in the .d.ts.

export interface Instance<Output extends Record<string, unknown>> {
  get(): Output | undefined;
  set(value: Output): void;
  remove(): void;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function create<S extends $AnyZodObject>(
  schema: S,
  key: string
): Instance<S['_zod']['output']> {
  // Real Zod types are used freely inside the body — never leak to .d.ts
  const _s = schema as unknown as z.ZodObject<any>;

  return {
    get() {
      const raw = localStorage.getItem(key);
      if (!raw) return undefined;
      const result = _s.safeParse(JSON.parse(raw));
      return result.success ? result.data : undefined;
    },
    set(value) {
      localStorage.setItem(key, JSON.stringify(_s.parse(value)));
    },
    remove() {
      localStorage.removeItem(key);
    },
  };
}

export function cast<T extends $AnyZodType>(
  schema: T,
  data: unknown
): T['_zod']['output'] | undefined {
  const _s = schema as unknown as z.ZodTypeAny;
  const result = _s.safeParse(data);
  return result.success ? result.data : undefined;
}
```

---

## 7. Rules, Conditions, and Limitations

This section is the complete and canonical reference. Every rule is stated
precisely, with the condition that activates it and any limitations.

---

### RULE 1 — Never use a Zod type as a top-level exported generic constraint

**Rule:**
No Zod type (`z.ZodObject<any>`, `z.ZodTypeAny`, `z.ZodType<any>`,
`AnyZodObject`, or any alias of these) may appear as the constraint of a generic
parameter in any exported function, exported class, or exported type alias.

**Condition that triggers the hang:**
The constraint is a Zod type AND the type parameter uses `any` (explicit or
implicit).

**Why:**
TypeScript expands generic constraints eagerly — the moment it reads the
declaration file. Zod's types are built from deeply recursive conditional types.
With `any`, TypeScript cannot short-circuit and must fully expand every branch.
This expansion happens on every consumer import.

**Limitation:**
This rule applies to **top-level constraints** only. A Zod type inside a
nested return-type property is evaluated lazily (see Rule 5) and is safe,
though still not ideal.

```ts
// ❌ Violates Rule 1
export function fn<S extends z.ZodObject<any>>(s: S): void

// ✅ Complies with Rule 1
type $AnyZodObject = { readonly _zod: { readonly output: Record<string, unknown> }; shape: Record<string, unknown> }
export function fn<S extends $AnyZodObject>(s: S): void
```

---

### RULE 2 — Never use `z.infer<T>` directly in an exported signature

**Rule:**
`z.infer<T>` must not appear in any exported function's parameter types or
return types, nor in any exported interface or type alias, when T is resolved
using a Zod type constraint.

**Condition that triggers the hang:**
`z.infer<T>` appears in the signature AND T is constrained by a Zod type at the
top level of the same signature.

**Why:**
`z.infer<T>` is itself defined using a conditional type over Zod internals. When
the compiler writes it into a `.d.ts` file, it carries the `import { z }` with
it. Evaluating it at load time forces Zod's full type system to be processed.

**Fix:**
Replace `z.infer<T>` with `T['_zod']['output']` in all exported signatures.
These produce identical inferred types for consumers.

```ts
// ❌ Violates Rule 2
export function parse<T extends z.ZodTypeAny>(s: T, d: unknown): z.infer<T>

// ✅ Complies with Rule 2
export function parse<T extends $AnyZodType>(s: T, d: unknown): T['_zod']['output']
```

---

### RULE 3 — Never re-export a Zod type from your library's public API

**Rule:**
No Zod type, class, interface, or alias sourced from the `'zod'` package may
appear in an `export` statement at the top level of your library's public API.

**Condition:**
Any `export type`, `export interface`, or `export` statement that resolves to
or includes a Zod type.

**Why:**
Re-exporting a Zod type embeds it directly in the `.d.ts` file as a top-level
declaration. Every consumer who imports anything from your library will trigger
Zod's full type load — even if they never use the re-exported type.

**Limitation:**
This applies to `export type` as well as runtime `export`. Type-only re-exports
are equally harmful because they still appear in `.d.ts` files.

```ts
// ❌ Violates Rule 3
export type { ZodObject } from 'zod';
export type MySchema = z.ZodObject<{ id: z.ZodString }>;

// ✅ Complies with Rule 3
export type MySchema = { id: string }; // Use the inferred plain type instead
```

---

### RULE 4 — Keep all Zod runtime usage inside function bodies

**Rule:**
Any use of Zod's runtime API (`schema.parse()`, `schema.safeParse()`,
`z.object()`, etc.) must stay inside function or method **bodies**. It must not
appear in exported type positions.

**Condition:**
Always applies to any function or method whose signature is exported.

**Why:**
Code inside function bodies is JavaScript — it is compiled away and never
written to `.d.ts` files. Type-level code in signatures is written to `.d.ts`
files verbatim. Keeping Zod in bodies means it stays in the `.js` bundle and
never leaks into the type system that tsserver loads.

**How to access Zod types in a body when the signature uses structural types:**

```ts
export function process<S extends $AnyZodObject>(schema: S) {
  // One cast — from the structural type to the real Zod type.
  // This cast is erased at compile time.
  const _s = schema as unknown as z.ZodObject<any>;
  return _s.parse({});
}
```

---

### RULE 5 — Zod types nested in return-type properties are lazy (use with care)

**Rule:**
A Zod type appearing only inside a **return-type property** (i.e., a method
signature inside an object type that is the return type of an exported function)
is evaluated lazily by TypeScript and does not cause an import-time hang.

**Condition:**
The top-level constraint of the exported function must be a plain interface or
structural type (not a Zod type). The Zod type must be nested at least one level
deep inside the return type.

**Why it is lazy:**
TypeScript only resolves nested return-type properties when the consumer actually
accesses that property and calls the method. By that point, the consumer's own
`import { z } from 'zod'` has been processed and Zod is already cached.

**Limitation:**
This is a behavioral observation, not a guarantee. It depends on the specific
TypeScript version and language server behavior. Relying on laziness is fragile.
The structural-type approach (Rules 1–4) eliminates the Zod import from `.d.ts`
entirely and is always the safer, more reliable choice.

```ts
// Acceptable — but structural types are still preferred
export function makeHandler<C extends IConfig>(config: C): C & {
  parse: <T extends z.ZodTypeAny>(schema: T) => z.infer<T> | undefined;
}
```

---

### RULE 6 — Declare Zod as `peerDependency`, not `dependency`

**Rule:**
In your library's `package.json`, Zod must be listed under `peerDependencies`,
not `dependencies`. It should also appear in `devDependencies` for local
development.

**Condition:**
This rule applies to any published library whose declaration files reference Zod
(even if you apply Rules 1–4, this remains best practice).

**Why:**
When Zod is a `dependency`, npm may install a separate copy nested inside your
library's `node_modules`. That copy is at a different absolute path than the
consumer's Zod. tsserver has not cached it and must parse Zod's type system
again from scratch — even if it already did so for the consumer's own Zod.

When Zod is a `peerDependency`, there is only one copy, at one path, already
cached in tsserver.

**Limitation:**
This rule eliminates the re-parse problem (Cause 2) but does not eliminate the
eager-expansion problem (Cause 1). Both rules must be applied together for a
fully clean library. If Rules 1–4 are fully applied (no Zod in `.d.ts` at all),
the `peerDependency` rule becomes a quality-of-life improvement rather than a
strict requirement.

```json
// ✅ Correct package.json
{
  "peerDependencies": { "zod": ">=4.0.0" },
  "devDependencies": { "zod": "^4.0.0" }
}

// ❌ Causes possible re-parse
{
  "dependencies": { "zod": "^4.0.0" }
}
```

---

### RULE 7 — Verify every build with a grep check

**Rule:**
After every build, before publishing, run:

```bash
grep -rn "^import.*zod" build/
```

The output must be **empty**. Any match is a violation of Rules 1–3.

**Condition:**
Must be run after the build step that generates `.d.ts` files (`tsc`, `tsup`,
etc.). Must be run before tagging or publishing.

**Why:**
It is easy to accidentally introduce a Zod type into a signature through
refactoring. This check catches regressions instantly, before they reach
consumers.

**Limitation:**
This check only catches top-level `import` statements at the start of a line.
Run it on all output directories if your build produces multiple bundles
(ESM, CJS, UMD, etc.).

```bash
# Check all bundles
grep -rn "^import.*zod" dist/
grep "^import" dist/esm/index.d.mts
grep "^import" dist/cjs/index.d.ts
```

---

### RULE 8 — Structural types must mirror Zod's actual internal shape

**Rule:**
The local structural types you define (`$AnyZodObject`, `$AnyZodType`, etc.)
must accurately reflect the internal shape of real Zod objects so that a genuine
Zod schema passes the structural check.

**Condition:**
This rule applies if you are upgrading Zod across a major version that changes
internal field names (e.g., Zod v3 vs. Zod v4).

**Why:**
TypeScript structural compatibility is based on shape. If your local structural
type references a field name that no longer exists in the actual Zod object, the
cast will silently pass but inference will break.

**Zod v4 correct shapes:**

```ts
// For z.ZodObject<any> in Zod v4:
type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

// For z.ZodTypeAny in Zod v4:
type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};
```

**Limitation:**
If you upgrade to a future Zod version that changes `_zod.output` to a
different field, you must update these structural types. Keep a comment in your
source file noting which Zod version the structural types were written for.

---

### RULE 9 — Apply all rules to every exported symbol, not just functions

**Rule:**
Rules 1–3 apply equally to: exported functions, exported classes, exported
interfaces, exported type aliases, exported enums that reference types, and
re-exported symbols. It is not sufficient to fix only functions.

**Condition:**
Any symbol that appears in an `export` statement and whose definition directly
or indirectly references a Zod type.

**Common places this is missed:**

```ts
// ❌ Exported class with Zod in a method signature
export class SchemaRunner<S extends z.ZodObject<any>> { ... }

// ❌ Exported interface with Zod field
export interface Config { schema: z.ZodTypeAny }

// ❌ Exported type alias using z.infer
export type Output<T extends z.ZodTypeAny> = z.infer<T>;

// ✅ All fixed with structural types
export class SchemaRunner<S extends $AnyZodObject> { ... }
export interface Config { schema: $AnyZodType }
export type Output<T extends $AnyZodType> = T['_zod']['output'];
```

---

### Conditions Summary Table

| Condition | Hang occurs? | Severity |
|---|---|---|
| `z.ZodObject<any>` as top-level constraint | ✅ Yes | Critical |
| `z.ZodTypeAny` as top-level constraint | ✅ Yes | Critical |
| `z.ZodType<any>` as top-level constraint | ✅ Yes | Critical |
| `AnyZodObject` as top-level constraint | ✅ Yes | Critical |
| `z.infer<T>` in exported return type (T = Zod constraint) | ✅ Yes | Critical |
| Zod type re-exported from the library | ✅ Yes | Critical |
| Zod type in exported interface field | ✅ Yes | High |
| Zod type in nested return-type property only | ⚠️ Usually no | Low-Medium |
| Zod as `dependency` with clean `.d.ts` | ⚠️ Possible tsserver re-parse | Low |
| Zod as `dependency` + Zod in top-level constraint | ✅ Yes | Critical + compounded |
| Zod only inside function bodies | ✅ No — never emitted to `.d.ts` | None |
| Local structural type as constraint | ✅ No | None |
| `T['_zod']['output']` in return type | ✅ No | None |

---

### Limitations of the Structural Type Approach

1. **Zod version coupling.** The field `_zod.output` is an internal
   implementation detail of Zod. If a future major version renames it, the
   structural types must be updated.

2. **No full API surface.** The structural types expose only the minimum shape
   needed for inference. Inside function bodies you must cast to the full Zod
   type to access methods like `.parse()`, `.safeParse()`, `.shape`, etc.

3. **Does not help end-application code.** This technique is only for
   **library authors**. End-application developers who import Zod directly do
   not need structural types — they own the entire dependency tree and tsserver
   loads Zod once and caches it for the whole project.

4. **Partial fix is not enough.** Fixing only the return type but leaving a Zod
   type in the constraint still causes the hang. Both must be clean.

5. **Grep check is line-anchored.** `grep "^import.*zod"` catches top-of-file
   import statements. If a declaration file somehow inlines a Zod type without
   a standard import (e.g., via `import()` type syntax), the grep will miss it.
   Review `.d.ts` files manually if something seems off.

---

## 8. How to Verify You Are Clean

Run these after every build. All must return **no output**.

```bash
# Check the entire build output directory recursively
grep -rn "^import.*zod" dist/
```

For projects with multiple output bundles:

```bash
grep "^import" dist/esm/index.d.mts
grep "^import" dist/cjs/index.d.ts
grep "^import" dist/umd/index.d.ts
```

If any line mentions `zod`, trace it back:

1. Find which exported symbol in your source references a Zod type.
2. Replace the constraint with `$AnyZodObject` or `$AnyZodType`.
3. Replace `z.infer<T>` in return types with `T['_zod']['output']`.
4. Rebuild and re-check.

---

## 9. Pre-Publish Checklist

Before tagging and publishing any version of a library that uses Zod:

**Signature hygiene**
- [ ] No Zod types in any exported generic constraint
- [ ] No Zod types in any exported function parameter type
- [ ] No Zod types in any exported function return type
- [ ] No Zod types in any exported interface field
- [ ] No Zod types re-exported from the public API
- [ ] `z.infer<T>` replaced with `T['_zod']['output']` everywhere in exported signatures

**Local structural types**
- [ ] `$AnyZodObject` is defined locally and used at all `ZodObject` constraint boundaries
- [ ] `$AnyZodType` is defined locally and used at all `ZodTypeAny` constraint boundaries
- [ ] Structural types match the current Zod version's internal field names

**Body-level Zod usage**
- [ ] All Zod runtime calls (`parse`, `safeParse`, etc.) are inside function bodies
- [ ] All casts (`as unknown as z.ZodObject<any>`) are inside function bodies

**Build verification**
- [ ] `grep -rn "^import.*zod" dist/` returns zero results
- [ ] All bundles checked (ESM, CJS, and any others)

**package.json**
- [ ] Zod is listed under `peerDependencies`
- [ ] Zod is listed under `devDependencies` for local development
- [ ] Zod is NOT listed under `dependencies`

**Tests**
- [ ] All tests pass against the built output, not just the source
