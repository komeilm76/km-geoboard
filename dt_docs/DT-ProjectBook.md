# DT-ProjectBook

> Structure and conventions for the project task book — step-by-step implementation guide.

---

## Overview

The **project book** is a structured collection of task pages.  
When all pages are completed, the full project is implemented and ready for use.

Each page describes exactly one small, completable task.  
Pages are independent enough that they can be done in order or in small parallel groups.

---

## Book Structure

```
project-book/
├── README.md                        ← Book index and reading guide
├── 00-foundations/
│   ├── 00-01 (monorepo-setup)/
│   │   ├── TASK.md
│   │   └── CHECKLIST.md
│   ├── 00-02 (shared-types)/
│   │   ├── TASK.md
│   │   └── CHECKLIST.md
│   └── 00-03 (zod-utils)/
│       ├── TASK.md
│       └── CHECKLIST.md
├── 01-artboard/
│   ├── 01-01 (artboard-types)/
│   ├── 01-02 (create-artboard)/
│   ├── 01-03 (resize-move)/
│   ├── 01-04 (snap-to-grid)/
│   └── 01-05 (artboard-tests)/
├── 02-geojson/
│   ├── 02-01 (geojson-types)/
│   ├── 02-02 (geojson-schemas)/
│   ├── 02-03 (geojson-parse)/
│   └── 02-04 (geojson-tests)/
├── 03-svg/
│   ├── 03-01 (svg-types)/
│   ├── 03-02 (svg-schemas)/
│   ├── 03-03 (svg-parse)/
│   ├── 03-04 (svg-to-geojson)/
│   └── 03-05 (svg-tests)/
├── 04-map/
│   ├── 04-01 (map-types)/
│   ├── 04-02 (projection)/
│   ├── 04-03 (tiles)/
│   ├── 04-04 (distance-area)/
│   ├── 04-05 (bounds)/
│   └── 04-06 (map-tests)/
├── 05-imports/
│   ├── 05-01 (import-types)/
│   ├── 05-02 (import-geojson)/
│   ├── 05-03 (import-svg)/
│   ├── 05-04 (import-openlayers)/
│   ├── 05-05 (import-auto)/
│   └── 05-06 (import-tests)/
├── 06-exports/
│   ├── 06-01 (export-types)/
│   ├── 06-02 (export-svg)/
│   ├── 06-03 (export-geojson)/
│   ├── 06-04 (export-openlayers)/
│   ├── 06-05 (export-pdf-meta)/
│   ├── 06-06 (export-raster-plan)/
│   └── 06-07 (export-tests)/
└── 07-plugins/
    ├── 07-01 (plugin-types)/
    ├── 07-02 (plugin-registry)/
    ├── 07-03 (dependency-resolver)/
    └── 07-04 (plugin-tests)/
```

---

## Page Format

Every task folder contains two files:

### `TASK.md`

Full task description. Required sections:

```md
# Page XX-YY — Task Title

## Summary
One paragraph. What does this task build? Why does it exist?

## Target
What is the finished state? What file(s) exist when this task is done?

## Dependencies
What must be completed before this task can start?
List: page numbers or package names.

## Inputs
What information, data, or existing code does this task use?

## Outputs
Files created or modified by this task.
For each file: path, format, purpose.

## Step-by-Step Instructions
Numbered steps. Each step is one concrete action.
1. ...
2. ...

## Acceptance Criteria
Bullet list. How do you know this task is done correctly?
- [ ] ...
- [ ] ...

## Notes
Edge cases, gotchas, links to relevant DT-* documents.
```

### `CHECKLIST.md`

A concise, standalone checklist — used during or after implementation to verify completion.

```md
# Checklist — Page XX-YY Task Title

- [ ] File created at correct path
- [ ] Types match DT-* spec
- [ ] Zod schema present and matches type
- [ ] Function is pure (no side effects)
- [ ] JSDoc comment with @param, @returns, @example
- [ ] Tests cover happy path
- [ ] Tests cover all error codes
- [ ] help.md updated
- [ ] CHANGELOG.md entry added
- [ ] `grep -rn "^import.*zod" dist/` returns empty
```

---

## Page Numbering Convention

```
XX-YY (short-title)
│   │   └── Short kebab-case title (2–4 words)
│   └────── Task number within the chapter (01, 02, ...)
└────────── Chapter number (00 = foundations, 01 = artboard, ...)
```

---

## Sample Task Page

### `01-02 (create-artboard)/TASK.md`

```md
# Page 01-02 — Create Artboard Function

## Summary
Implements the `createArtboard` function — the core function that takes two canvas
points and produces a normalized Artboard object.

## Target
`packages/artboard/src/createArtboard.ts` exists and exports `createArtboard`.

## Dependencies
- Page 00-01 (monorepo-setup) — workspace must be initialized
- Page 00-02 (shared-types) — Result<T> type must exist
- Page 00-03 (zod-utils) — finiteNumber(), uuid(), etc. must be available
- Page 01-01 (artboard-types) — Artboard, CreateArtboardInput, CreateArtboardResult

## Inputs
- DT-Artboard.md — full function specification
- DT-Inputs-and-Outputs.md — input/output contract rules
- DT-Zod.md — safeParse pattern

## Outputs
| File | Purpose |
|---|---|
| `packages/artboard/src/createArtboard.ts` | Function implementation |
| `packages/artboard/src/schemas.ts` | CreateArtboardInputSchema (add to existing) |
| `packages/artboard/tests/createArtboard.test.ts` | Vitest tests |

## Step-by-Step Instructions

1. Open `packages/artboard/src/createArtboard.ts` (create if not exists).
2. Import `Result` from `@yourscope/shared`.
3. Import `Artboard`, `CreateArtboardInput` from `./types`.
4. Import `CreateArtboardInputSchema` from `./schemas`.
5. Implement `createArtboard(input)`:
   a. Run `CreateArtboardInputSchema.safeParse(input)`.
   b. If failed, return `{ success: false, error: { code: "invalid-input", ... } }`.
   c. Compute origin: `{ x: Math.min(x1, x2), y: Math.min(y1, y2) }`.
   d. Compute size: `{ width: Math.abs(x2-x1), height: Math.abs(y2-y1) }`.
   e. If `width < minSize || height < minSize`, return `{ success: false, error: { code: "too-small" } }`.
   f. Generate ID with `crypto.randomUUID()`.
   g. Return `{ success: true, data: Artboard }`.
6. Add JSDoc with @param, @returns, @example.
7. Export from `packages/artboard/src/index.ts`.

## Acceptance Criteria
- [ ] Function returns correct origin for all 4 drag directions
- [ ] Function returns `too-small` error when width or height < minSize
- [ ] Function returns `invalid-input` error for non-finite coordinates
- [ ] Default name is "Artboard"
- [ ] Default minSize is 1
- [ ] All test cases pass
- [ ] JSDoc present
- [ ] No `any` in signatures

## Notes
- See DT-Artboard.md §"Core Concept" for drag direction normalization diagram.
- See DT-Zod.md §"IDE-Safe Library Rules" — do NOT use Zod types in the function signature.
- The `crypto.randomUUID()` call is inside the function body, so it is not a side effect
  in the pure-function sense — the function is deterministic given a fixed ID input.
  If determinism in tests is required, pass `id` in the input.
```

---

## Book README

The book's root `README.md` must contain:

1. **Introduction** — what this book is, how to use it.
2. **Chapter overview** — one line per chapter with its scope.
3. **Dependency diagram** — which chapters depend on which.
4. **Estimated effort** — rough hour estimates per chapter.
5. **How to track progress** — suggest using GitHub Issues or a project board, one issue per task page.

---

## File Location

```
project-book/
  README.md
  00-foundations/
    00-01 (monorepo-setup)/
      TASK.md
      CHECKLIST.md
    ...
  01-artboard/
    ...
  ...
```

The project book lives at the **monorepo root**, not inside any package.  
It is documentation only — no TypeScript, no tests, no build step.
