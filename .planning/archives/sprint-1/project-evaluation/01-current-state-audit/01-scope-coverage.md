# 1. Scope coverage — design vs. implementation

All 8 chapters of the project-book (40 pages) have corresponding source files. Scope-wise
the project-book is essentially **complete**:

| Chapter | Package | Source present | Tests present | Spec functions covered |
|---|---|---|---|---|
| 00 Foundations | `km-shared` | ✅ types, zodUtils, zodStructural | ✅ 62 tests | Full |
| 01 Artboard | `km-artboard` | ✅ all 8 DT-Artboard functions | ✅ 5 suites | Full |
| 02 GeoJSON | `km-geojson` | ✅ types, schemas, parse, guards, feature, geometry | ✅ 4 suites | Full |
| 03 SVG | `km-svg` | ✅ parseSvgDocument, parseSvgPath, serializeSvgPath, svgToGeoJson | ✅ 3 suites | Full |
| 04 Map | `km-map` | ✅ projection, tiles, distance, bounds + extra (scale, layers) | ✅ 6 suites, 128 tests | Full + extras |
| 05 Imports | `km-imports` | ✅ all 5 importers + detect | ✅ 4 suites | Full |
| 06 Exports | `exports` ⚠️ | ✅ all 5 exporters + filter | ✅ 6 suites, 93 tests | Full |
| 07 Plugins | `km-plugins` | ✅ registry, resolver, debug | ✅ 43 tests | Full |
