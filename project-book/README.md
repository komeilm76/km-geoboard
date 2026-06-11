# Project Book

> Step-by-step implementation guide for the full monorepo.  
> Complete every page in order and the project is done.

---

## What This Book Is

This book is a structured sequence of small, completable task pages.  
Each page builds exactly one thing — a type file, a function, a schema, a test suite.  
When every page is checked off, the entire project is implemented, tested, and ready to publish.

The book does not contain code. It tells you **what** to build, **why** it exists,  
**what inputs** it consumes, **what files** it produces, and **how to verify** it is done correctly.

Read the referenced `DT-*` design documents alongside the pages.  
They contain the full type definitions, schemas, and function specifications.

---

## How to Use This Book

1. Work through chapters in order — earlier chapters are dependencies for later ones.
2. Inside a chapter, pages are also ordered — complete them top to bottom.
3. For each page: read `TASK.md` fully before writing any code.
4. Use `CHECKLIST.md` as your final sign-off before moving to the next page.
5. Track one GitHub Issue per page. Close the issue only when the checklist is fully checked.

---

## Chapter Overview

| Chapter | Scope | Pages |
|---|---|---|
| **00 — Foundations** | Monorepo setup, shared types, Zod utilities, structural Zod types | 3 |
| **01 — Artboard** | Artboard types, create/resize/move/snap functions, tests | 5 |
| **02 — GeoJSON** | Full RFC 7946 types, Zod schemas, parse/guard functions, tests | 4 |
| **03 — SVG** | SVG element types, schemas, XML parser, SVG→GeoJSON pipeline, tests | 5 |
| **04 — Map** | Coordinate types, projections, tile math, distance/area, bounds, tests | 6 |
| **05 — Imports** | Import types, GeoJSON/SVG/OpenLayers/artboard parsers, auto-detect, tests | 6 |
| **06 — Exports** | Export types, SVG/GeoJSON/OpenLayers/PDF-meta/raster-plan serializers, tests | 7 |
| **07 — Plugins** | Plugin types, registry, dependency resolver, tests | 4 |

**Total pages: 40**

---

## Dependency Diagram

```
00-foundations
    │
    ├──► 01-artboard
    │
    ├──► 02-geojson
    │        │
    │        ├──► 03-svg ──────────────────┐
    │        │        │                    │
    │        │        └──► 04-map          │
    │        │                 │           │
    │        └─────────────────┼───────────┼──► 05-imports
    │                          │           │         │
    │                          └───────────┼──► 06-exports
    │                                      │
    └──────────────────────────────────────┴──► 07-plugins
```

- **00** has no dependencies — start here.
- **01**, **02** depend only on **00** — can be done in parallel after **00**.
- **03** depends on **00** and **02**.
- **04** depends on **00** and **02**.
- **05** depends on **00**, **01**, **02**, **03**.
- **06** depends on **00**, **01**, **02**, **03**.
- **07** depends on **00** only.

---

## Estimated Effort

| Chapter | Estimated Hours |
|---|---|
| 00 — Foundations | 3–4 h |
| 01 — Artboard | 4–6 h |
| 02 — GeoJSON | 4–5 h |
| 03 — SVG | 6–8 h |
| 04 — Map | 5–7 h |
| 05 — Imports | 5–7 h |
| 06 — Exports | 6–8 h |
| 07 — Plugins | 4–5 h |
| **Total** | **37–50 h** |

Estimates assume one developer, comfortable with TypeScript and Zod.

---

## Tracking Progress

Suggested GitHub workflow:

1. Create a GitHub Project board with columns: `Backlog`, `In Progress`, `Review`, `Done`.
2. Open one Issue per page, titled exactly: `Page XX-YY — Task Title`.
3. Paste the `CHECKLIST.md` content into the issue body.
4. Move cards across columns as you work.
5. Close the issue only when every checkbox is ticked and CI passes.

---

## Key Reference Documents

| Document | What it covers |
|---|---|
| `DT-Artboard.md` | Artboard geometry, all function signatures |
| `DT-GeoJSON.md` | Full RFC 7946 types and Zod schemas |
| `DT-SVG.md` | SVG element types, parsing, SVG→GeoJSON |
| `DT-Map.md` | Coordinate systems, projections, tile math |
| `DT-Imports.md` | Import pipeline, format detection, error codes |
| `DT-Exports.md` | Export pipeline, filters, output types |
| `DT-Plugins.md` | Plugin system, registry, dependency resolution |
| `DT-Logics.md` | Code rules, testing conventions, CI checklist |
| `DT-Inputs-and-Outputs.md` | Input/output contract, `Result<T>`, reversibility |
| `DT-Zod.md` | Zod usage, `safeParse` pattern, IDE-safe rules |
| `DT-Flexibility.md` | Monorepo structure, `tsup` config, `package.json` shape |
| `DT-Figma.md` | Figma concepts and their project equivalents |
| `zod_hang.md` | Deep explanation of the Zod IDE-freeze problem |

---

## Conventions Used in This Book

- `@yourscope` is a placeholder. Replace with your actual npm scope.
- All paths are relative to the monorepo root.
- `Result<T>` always means `{ success: true; data: T } | { success: false; error: ResultError }`.
- "Pure function" means: no side effects, no mutations, deterministic output.
- Every function that can fail returns `Result<T>` — it never throws.
