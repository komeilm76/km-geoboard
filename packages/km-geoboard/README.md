# @komeilm76/km-geoboard

Umbrella package for the **km-geoboard** suite. One install, one entry point:

```bash
pnpm add @komeilm76/km-geoboard zod
```

```typescript
import { artboard, svg, geojson, map, imports, exports, plugins } from '@komeilm76/km-geoboard';

// Create an artboard
const result = artboard.createArtboard({
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 800, y: 600 },
  name: 'Main',
});

// Parse an SVG, convert to GeoJSON, export it back
const doc = svg.parseSvgDocument(svgString);
if (doc.success) {
  const fc = svg.svgDocumentToFeatureCollection(doc.data, geoMeta);
  if (fc.success) {
    const out = exports.exportToGeoJson({ features: fc.data.features });
  }
}
```

## Namespaces

| Namespace | Package | Purpose |
|---|---|---|
| `shared` | `@komeilm76/km-shared` | `Result<T>`, structural Zod types |
| `artboard` | `@komeilm76/km-artboard` | Canvas artboard creation and manipulation |
| `geojson` | `@komeilm76/km-geojson` | GeoJSON types, guards, geometry helpers |
| `svg` | `@komeilm76/km-svg` | SVG parsing, serialization, SVG→GeoJSON |
| `map` | `@komeilm76/km-map` | Projections, tiles, geodesic math, bounds |
| `imports` | `@komeilm76/km-imports` | Parse raw strings/objects into typed structures |
| `exports` | `@komeilm76/km-exports` | Serialize to SVG, GeoJSON, OpenLayers, PDF meta, raster plans |
| `plugins` | `@komeilm76/km-plugins` | Typed plugin registry with dependency resolution |

Individual packages remain installable on their own for tree-shaking-conscious consumers.

This package is also the home of the cross-package **integration test suite**
(`tests/integration/`), which verifies the round-trip contracts between packages.

## License

MIT
