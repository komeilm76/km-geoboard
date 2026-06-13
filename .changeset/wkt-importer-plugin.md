---
'@komeilm76/km-imports': minor
---

feat(wkt): ship WKT importer as a km-plugins plugin (F-001 + F-005)

- `importWkt` is now exported from the public index (was internal only)
- `detectImportFormat` recognises WKT strings (`POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`, `GEOMETRYCOLLECTION` prefixes, case-insensitive, with optional Z/M/ZM modifiers)
- `importAuto` dispatches `format: "wkt"` to `importWkt`; `AutoImportResult` and `DetectedFormat` types include the new `"wkt"` branch
- `ImportErrorCode` now includes `"invalid-wkt"`
- New `wktImporterPlugin: Plugin<WktImporterApi>` and `WKT_IMPORTER_PLUGIN_ID` constant exported from the package — validates the formats-as-plugins pattern for future KML/GPX/TopoJSON importers
