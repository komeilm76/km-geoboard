---
'@komeilm76/km-geoboard': minor
---

New umbrella package `@komeilm76/km-geoboard` (Phase B, P2): re-exports the
public surface of all eight packages under namespaces (`shared`, `artboard`,
`geojson`, `svg`, `map`, `imports`, `exports`, `plugins`) so app consumers
need a single install. Also hosts the cross-package integration test suite
(P3): SVG → GeoJSON → export round-trips, import/export deep-equal cycles,
artboard snapshot round-trip, tile math round-trips, `importAuto` routing,
and a plugin-wrapped importer.
