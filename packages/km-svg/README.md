# @komeilm76/km-svg

SVG content as structured data — parse SVG XML into typed element trees, parse and serialize path data, and convert SVG geometry to GeoJSON with real-world coordinates.

No DOM required: parsing is string-based (`fast-xml-parser`), so it runs identically in Node.js ≥ 18, browsers, and edge runtimes.

## Install

```bash
npm install @komeilm76/km-svg zod
# or
pnpm add @komeilm76/km-svg zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { parseSvgDocument, parseSvgPath, serializeSvgPath } from '@komeilm76/km-svg';

// Parse a full SVG document into a typed tree
const doc = parseSvgDocument(`
  <svg viewBox="0 0 100 100">
    <rect x="10" y="10" width="30" height="20" fill="#ff0000"/>
    <path d="M 10 10 L 90 90 Z" stroke="#000"/>
  </svg>
`);

if (doc.success) {
  doc.data.viewBox;          // { minX: 0, minY: 0, width: 100, height: 100 }
  doc.data.elements[0].type; // 'rect'
}

// Parse path data into typed commands
const cmds = parseSvgPath('M 10 10 L 90 90 C 20 30 40 50 60 70 Z');
if (cmds.success) {
  // [{ cmd: 'M', x: 10, y: 10 }, { cmd: 'L', x: 90, y: 90 }, ...]
  const d = serializeSvgPath(cmds.data); // back to a 'd' string
}
```

## SVG → GeoJSON

Give the converter a `SvgGeoMeta` that maps canvas space to geographic space, and every supported element becomes a GeoJSON feature:

```ts
import { parseSvgDocument, svgDocumentToFeatureCollection } from '@komeilm76/km-svg';
import type { SvgGeoMeta } from '@komeilm76/km-svg';

const meta: SvgGeoMeta = {
  svgBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },   // canvas space
  geoBounds: [-0.2, 51.4, 0.0, 51.6],                       // [west, south, east, north]
};

const doc = parseSvgDocument(svgString);
if (doc.success) {
  const fc = svgDocumentToFeatureCollection(doc.data, meta);
  if (fc.success) {
    // fc.data is a GeoJsonFeatureCollection; presentation attributes
    // (fill, stroke, opacity, …) are carried into feature properties
  }
}
```

Mapping rules: `rect`/`polygon` → `Polygon`, `circle`/`ellipse` → `Polygon` (64-point approximation), `line`/`polyline`/`path` → `LineString`/`Polygon` (closed paths), `text` → `Point`. Y-axis is flipped (SVG y grows down, latitude grows up).

## API

### Document parsing

| Function | Returns | Description |
|---|---|---|
| `parseSvgDocument(svgString)` | `Result<SvgDocument>` | Full document → typed element tree |
| `parseViewBox(value)` | `SvgViewBox \| undefined` | `"0 0 100 100"` → `{ minX, minY, width, height }` |
| `parseLength(value)` | `SvgLength` | `"10px"` → `{ value: 10, unit: 'px' }` |
| `parseColor(value)` | `SvgColor` | hex / rgb() / named colors |
| `parseTransform(value)` | `SvgTransform` | `"translate(10 20) rotate(45)"` → typed operations |

### Path data

| Function | Returns | Description |
|---|---|---|
| `parseSvgPath(d)` | `Result<SvgPathCommand[]>` | `d` attribute → typed commands (M, L, H, V, C, S, Q, T, A, Z — upper & lower case) |
| `serializeSvgPath(commands)` | `string` | Typed commands → `d` string |

### GeoJSON conversion

| Function | Returns | Description |
|---|---|---|
| `svgPointToGeoPosition(point, meta)` | `[lng, lat]` | Map one canvas point to geographic coordinates |
| `svgElementToGeoJsonFeature(element, meta)` | `Result<GeoJsonFeature>` | Convert one element |
| `svgDocumentToFeatureCollection(doc, meta)` | `Result<GeoJsonFeatureCollection>` | Convert a whole document (unsupported elements are skipped) |

## Types

| Type | Description |
|---|---|
| `SvgDocument` | `{ viewBox?, width?, height?, elements: SvgElement[] }` |
| `SvgElement` | Union of `SvgPathElement`, `SvgRectElement`, `SvgCircleElement`, `SvgEllipseElement`, `SvgLineElement`, `SvgPolylineElement`, `SvgPolygonElement`, `SvgTextElement`, `SvgGroupElement` |
| `SvgPathCommand` | Discriminated union on `cmd` — every SVG path command, absolute and relative |
| `SvgViewBox` | `{ minX, minY, width, height }` |
| `SvgLength` / `SvgLengthUnit` | Numeric value + unit (`px`, `%`, `em`, …) |
| `SvgColor` | Normalized color value |
| `SvgTransform` / `SvgTransformOperation` | Typed transform list |
| `SvgPresentationAttributes` | fill, stroke, opacity, strokeWidth, fillRule, … |
| `SvgCoreAttributes` | id, class, … |
| `SvgGeoMeta` | Canvas-to-geographic mapping: `{ svgBounds, geoBounds, crs? }` |

Every element type has a matching Zod schema (`SvgDocumentSchema`, `SvgPathElementSchema`, …) for validating untrusted data. Schemas use structural types, so the published declaration files never import Zod.

## Error handling

All fallible functions return `Result<T>` from `@komeilm76/km-shared` — no exceptions:

```ts
const doc = parseSvgDocument(input);
if (!doc.success) {
  console.error(doc.error.code, doc.error.message); // e.g. 'invalid-xml', …
}
```

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `svg` namespace |
| [`@komeilm76/km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) | The GeoJSON types this package converts into |
| [`@komeilm76/km-exports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-exports) | Serialize element trees back to SVG strings |
| [`@komeilm76/km-imports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-imports) | Auto-detecting import pipeline that wraps this parser |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-svg/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
