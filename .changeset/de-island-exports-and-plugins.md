---
'@komeilm76/km-exports': patch
'@komeilm76/km-plugins': patch
---

De-island km-exports and km-plugins (Phase B, P1 canonical dependency graph).

- `km-exports/src/types.ts` no longer redefines Artboard, SVG, GeoJSON, and
  Result types locally — they are imported from `@komeilm76/km-shared`,
  `@komeilm76/km-artboard`, `@komeilm76/km-svg`, and `@komeilm76/km-geojson`
  and re-exported under the same public names (GeoJson-prefixed aliases for
  Position/BoundingBox/LinearRing). Only export-specific types remain local.
- `GeoJsonFeatureCollection` in km-exports is now the canonical type extended
  with the export-specific OpenLayers `crs` annotation.
- `km-plugins/src/types.ts` no longer carries a local `Result`/`ResultError`
  copy — it imports and re-exports them from `@komeilm76/km-shared` (new
  workspace dependency).
- Removed leftover `release-it` scripts/devDependency from km-exports and
  km-plugins; devDependencies aligned with .planning/PACKAGE_STANDARDS.md §2.
