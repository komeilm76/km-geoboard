# P1. Canonical dependency graph (enforce what DT-Flexibility promises)

Target state — every arrow is a real `workspace:*` dependency, no duplicated types:

```
                 km-shared
        ┌───────┬────┴────┬─────────┐
   km-artboard  km-geojson  km-plugins
        │        ├─ km-svg
        │        ├─ km-map
        │        │
        ├────────┴──► km-imports   (uses shared, artboard, geojson, svg)
        └────────────► km-exports  (uses shared, artboard, geojson, svg)
```

Concrete actions:
1. `@komeilm76/km-exports` (renamed from `exports`): delete its locally re-declared Artboard / SVG /
   GeoJSON / Result types and import them from siblings. Keep only export-specific types
   (`ExportFilter`, `PdfMeta`, `RasterExportPlan`, option types) locally.
2. Add a type-identity CI check: the `_TypeCheck` pattern from `DT-Zod.md` §Schema
   Completeness in each package, so schema and type can never drift.
3. Forbid duplicate type definitions by convention: a type lives in exactly one package;
   everyone else imports it.
