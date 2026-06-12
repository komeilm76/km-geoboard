# @komeilm76/km-geoboard

Umbrella package for the **km-geoboard** suite — artboard geometry, GeoJSON, SVG, map math, import/export pipelines, and a plugin registry. One install, one entry point, everything namespaced.

```bash
npm install @komeilm76/km-geoboard zod
# or
pnpm add @komeilm76/km-geoboard zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { artboard, svg, geojson, map, imports, exports, plugins, shared } from '@komeilm76/km-geoboard';

// Create an artboard from two drag points
const result = artboard.createArtboard({
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 800, y: 600 },
  name: 'Main',
});

// Parse an SVG, convert it to GeoJSON, export it back out
const doc = svg.parseSvgDocument(svgString);
if (doc.success) {
  const geoMeta = {
    svgBounds: { minX: 0, minY: 0, maxX: 800, maxY: 600 },
    geoBounds: [-0.2, 51.4, 0.0, 51.6] as [number, number, number, number],
  };
  const fc = svg.svgDocumentToFeatureCollection(doc.data, geoMeta);
  if (fc.success) {
    const out = exports.exportToGeoJson({ features: fc.data.features, pretty: true });
    if (out.success) console.log(out.data); // GeoJSON string
  }
}

// Map math, no renderer needed
const tile = map.latLngToTile({ lat: 51.5074, lng: -0.1276 }, 12);
const dist = map.haversineDistance({ lat: 51.5, lng: -0.13 }, { lat: 48.86, lng: 2.35 });
```

Types come through the same namespaces:

```ts
import type { artboard, geojson } from '@komeilm76/km-geoboard';

type Board = artboard.Artboard;
type Feature = geojson.GeoJsonFeature;
```

## Namespaces

| Namespace | Package | Purpose |
|---|---|---|
| `shared` | [`@komeilm76/km-shared`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-shared) | `Result<T>`, Zod schema factories, structural Zod types |
| `artboard` | [`@komeilm76/km-artboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-artboard) | Create, resize, move, snap, and query canvas artboards |
| `geojson` | [`@komeilm76/km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) | RFC 7946 types, schemas, parsing, guards, geometry helpers |
| `svg` | [`@komeilm76/km-svg`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-svg) | SVG document/path parsing, serialization, SVG → GeoJSON |
| `map` | [`@komeilm76/km-map`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-map) | Projections, tiles, geodesic distance, bounds, scale, layers |
| `imports` | [`@komeilm76/km-imports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-imports) | Parse raw strings/objects into typed structures (auto-detecting) |
| `exports` | [`@komeilm76/km-exports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-exports) | Serialize to SVG, GeoJSON, OpenLayers, PDF meta, raster plans |
| `plugins` | [`@komeilm76/km-plugins`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-plugins) | Typed plugin registry with dependency resolution |

Each package's README documents its full API with examples — follow the links above. Individual packages remain installable on their own for tree-shaking-conscious consumers:

```ts
// Equivalent, smaller dependency surface:
import { createArtboard } from '@komeilm76/km-artboard';
```

## Design principles (suite-wide)

- **Pure functions** — no DOM, no I/O, no rendering, no mutation of inputs.
- **No exceptions** — fallible operations return the `Result<T>` discriminated union; check `success`.
- **IDE-safe types** — published `.d.ts` files never import Zod (structural types prevent TS-server hangs).
- **Runtime-portable** — Node.js ≥ 18, browsers, and edge runtimes.
- **Engine-agnostic** — OpenLayers/MapLibre/Leaflet are consumers, not dependencies.

## Integration tests

This package hosts the cross-package integration suite (`tests/integration/`), verifying round-trip contracts: SVG → GeoJSON → export → reparse, import/export deep-equality, artboard snapshot round-trips, tile math, `importAuto` routing, and plugin-wrapped importers.

Full reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-geoboard/help.md) · Monorepo: [komeilm76/km-geoboard](https://github.com/komeilm76/km-geoboard)

## License

MIT — [komeilm76](https://github.com/komeilm76)
