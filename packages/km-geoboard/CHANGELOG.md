# @komeilm76/km-geoboard

## 0.2.2

### Patch Changes

- b3fd5fc: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [b3fd5fc]
- Updated dependencies [b3fd5fc]
  - @komeilm76/km-shared@0.1.2
  - @komeilm76/km-artboard@0.1.3
  - @komeilm76/km-geojson@0.1.2
  - @komeilm76/km-svg@0.1.2
  - @komeilm76/km-map@0.1.2
  - @komeilm76/km-imports@0.3.0
  - @komeilm76/km-exports@0.1.3
  - @komeilm76/km-plugins@0.1.3

## 0.2.1

### Patch Changes

- 31dd255: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.
- Updated dependencies [31dd255]
- Updated dependencies [4e2c5c0]
  - @komeilm76/km-shared@0.1.1
  - @komeilm76/km-artboard@0.1.2
  - @komeilm76/km-geojson@0.1.1
  - @komeilm76/km-svg@0.1.1
  - @komeilm76/km-map@0.1.1
  - @komeilm76/km-imports@0.2.0
  - @komeilm76/km-exports@0.1.2
  - @komeilm76/km-plugins@0.1.2

## 0.2.0

### Minor Changes

- b8074de: New umbrella package `@komeilm76/km-geoboard` (Phase B, P2): re-exports the
  public surface of all eight packages under namespaces (`shared`, `artboard`,
  `geojson`, `svg`, `map`, `imports`, `exports`, `plugins`) so app consumers
  need a single install. Also hosts the cross-package integration test suite
  (P3): SVG → GeoJSON → export round-trips, import/export deep-equal cycles,
  artboard snapshot round-trip, tile math round-trips, `importAuto` routing,
  and a plugin-wrapped importer.

### Patch Changes

- Updated dependencies [b8074de]
- Updated dependencies [a2398e3]
  - @komeilm76/km-exports@0.1.1
  - @komeilm76/km-plugins@0.1.1
  - @komeilm76/km-artboard@0.1.1
  - @komeilm76/km-imports@0.1.1

## 0.1.0

Initial release — umbrella package re-exporting all eight km-geoboard packages
under namespaces (`shared`, `artboard`, `geojson`, `svg`, `map`, `imports`,
`exports`, `plugins`), plus the cross-package integration test suite.
