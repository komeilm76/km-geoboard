# km-svg

> SVG content as structured data. Parse SVG XML into typed element trees, manipulate paths, and convert SVG geometry to GeoJSON.

---

## Overview

`km-svg` models SVG documents as plain data objects — no DOM, no browser rendering.
It provides TypeScript types and Zod v4 schemas for every SVG element and attribute,
functions to parse SVG XML strings into structured objects, and a conversion pipeline
to produce GeoJSON from SVG geometry with real-world geographic positions.

---

## Installation

```bash
npm install @komeilm76/km-svg km-shared km-geojson zod
```

---

## Functions

### `parseSvgDocument(svgString)`

Parse an SVG XML string into a structured `SvgDocument`.

| Parameter | Type | Description |
|---|---|---|
| `svgString` | `string` | Raw SVG XML content |

Returns `Result<SvgDocument>`.

```ts
import { parseSvgDocument } from '@komeilm76/km-svg';

const result = parseSvgDocument(`<svg viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" fill="#ff0000"/>
</svg>`);

if (result.success) {
  console.log(result.data.elements[0]); // { type: 'rect', x: 10, y: 10, ... }
}
```

---

### `parseSvgPath(d)`

Parse an SVG path `d` attribute string into an array of `SvgPathCommand` objects.

| Parameter | Type | Description |
|---|---|---|
| `d` | `string` | SVG path data string |

Returns `Result<SvgPathCommand[]>`.

```ts
import { parseSvgPath } from '@komeilm76/km-svg';

const result = parseSvgPath('M 10 10 L 50 50 C 60 70 80 90 100 100 Z');
if (result.success) {
  result.data.forEach(cmd => console.log(cmd));
  // { cmd: 'M', x: 10, y: 10 }
  // { cmd: 'L', x: 50, y: 50 }
  // { cmd: 'C', x1: 60, y1: 70, x2: 80, y2: 90, x: 100, y: 100 }
  // { cmd: 'Z' }
}
```

---

### `serializeSvgPath(commands)`

Convert an array of `SvgPathCommand` objects back into an SVG path `d` string.
This function cannot fail — it always returns a string.

| Parameter | Type | Description |
|---|---|---|
| `commands` | `SvgPathCommand[]` | Array of parsed path commands |

Returns `string`.

```ts
import { parseSvgPath, serializeSvgPath } from '@komeilm76/km-svg';

const parsed = parseSvgPath('M 0 0 L 100 100 Z');
if (parsed.success) {
  const d = serializeSvgPath(parsed.data); // "M 0,0 L 100,100 Z"
  // Round-trip: parseSvgPath(serializeSvgPath(cmds)) ≡ cmds
}
```

---

### `svgPointToGeoPosition(point, meta)`

Convert a single SVG `[x, y]` canvas coordinate to a GeoJSON `[lng, lat]` position.

| Parameter | Type | Description |
|---|---|---|
| `point` | `[number, number]` | SVG canvas coordinate `[x, y]` |
| `meta` | `SvgGeoMeta` | Geographic metadata mapping SVG→geo |

Returns `[number, number]` — `[lng, lat]`.

**Formula:**
```
lng = west  + (x - svgBounds.minX) / svgBounds.width  × (east  − west)
lat = north − (y - svgBounds.minY) / svgBounds.height × (north − south)
```

Note: SVG `y` increases downward; latitude increases upward — so the Y axis is inverted.

```ts
import { svgPointToGeoPosition } from '@komeilm76/km-svg';

const meta = {
  svgBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  geoBounds: [-180, -90, 180, 90] as [number, number, number, number],
};

svgPointToGeoPosition([0, 0], meta);    // [-180, 90]  — top-left → NW corner
svgPointToGeoPosition([50, 50], meta);  // [0, 0]      — center
svgPointToGeoPosition([100, 100], meta); // [180, -90] — bottom-right → SE corner
```

---

### `svgElementToGeoJsonFeature(element, meta)`

Convert a single SVG element into a GeoJSON Feature.
SVG presentation attributes (`fill`, `stroke`, etc.) are stored in `Feature.properties`.

| Parameter | Type | Description |
|---|---|---|
| `element` | `SvgElement` | Any parsed SVG element |
| `meta` | `SvgGeoMeta` | Geographic metadata |

Returns `Result<GeoJsonFeature>`.

**Element → Geometry mapping:**

| SVG Element | GeoJSON Geometry |
|---|---|
| `rect` | `Polygon` (5-point closed ring) |
| `circle` | `Polygon` (64-point approximation) |
| `ellipse` | `Polygon` (64-point approximation, using `rx` and `ry`) |
| `line` | `LineString` (2 points) |
| `polyline` | `LineString` |
| `polygon` | `Polygon` (first point appended as last to close ring) |
| `path` | `Polygon` (if contains `Z`) or `LineString` (open) |
| `text` | `Point` (at anchor `x`, `y`) |
| `g` (group) | `GeometryCollection` (recursive, all children) |

---

### `svgDocumentToFeatureCollection(doc, meta)`

Convert an entire `SvgDocument` into a GeoJSON `FeatureCollection`.
Elements that fail to convert are skipped with a console warning — the conversion does not abort.

| Parameter | Type | Description |
|---|---|---|
| `doc` | `SvgDocument` | Parsed SVG document |
| `meta` | `SvgGeoMeta` | Geographic metadata |

Returns `Result<GeoJsonFeatureCollection>`.

```ts
import { parseSvgDocument, svgDocumentToFeatureCollection } from '@komeilm76/km-svg';

const svgResult = parseSvgDocument(svgString);
if (!svgResult.success) throw new Error(svgResult.error.message);

const meta = {
  svgBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 800 },
  geoBounds: [44.0, 35.0, 63.0, 40.0] as [number, number, number, number],
};

const geoResult = svgDocumentToFeatureCollection(svgResult.data, meta);
if (geoResult.success) {
  console.log(geoResult.data); // { type: 'FeatureCollection', features: [...] }
}
```

---

## Types

### `SvgDocument`

| Field | Type | Required |
|---|---|---|
| `viewBox` | `SvgViewBox` | No |
| `width` | `SvgLength` | No |
| `height` | `SvgLength` | No |
| `elements` | `SvgElement[]` | Yes |

### `SvgViewBox`

| Field | Type |
|---|---|
| `minX` | `number` |
| `minY` | `number` |
| `width` | `number` |
| `height` | `number` |

### `SvgLength`

| Field | Type |
|---|---|
| `value` | `number` |
| `unit` | `SvgLengthUnit` |

`SvgLengthUnit`: `"px" | "pt" | "pc" | "mm" | "cm" | "in" | "em" | "ex" | "rem" | "vw" | "vh" | "%" | ""`

### `SvgColor` (5 variants)

| `type` | Extra fields |
|---|---|
| `"hex"` | `value: string` (e.g. `"#ff0000"`) |
| `"rgb"` | `r, g, b: number` (0–255) |
| `"rgba"` | `r, g, b: number`, `a: number` (0–1) |
| `"named"` | `value: string` (e.g. `"red"`, `"currentColor"`) |
| `"none"` | _(no extra fields)_ |

### `SvgTransformOperation` (6 variants)

| `type` | Fields |
|---|---|
| `"translate"` | `tx, ty: number` |
| `"scale"` | `sx, sy: number` |
| `"rotate"` | `angle: number`, `cx?, cy?: number` |
| `"skewX"` | `angle: number` |
| `"skewY"` | `angle: number` |
| `"matrix"` | `a, b, c, d, e, f: number` |

### `SvgGeoMeta`

| Field | Type | Description |
|---|---|---|
| `svgBounds` | `{ minX, minY, maxX, maxY: number }` | SVG canvas coordinate space |
| `geoBounds` | `[west, south, east, north]` | Geographic bounding box (degrees) |
| `crs` | `string` (optional) | CRS identifier, default `"EPSG:4326"` |

### Element Types Summary

| Type | Key fields |
|---|---|
| `SvgPathElement` | `type: "path"`, `d: string` |
| `SvgRectElement` | `type: "rect"`, `x, y, width, height`, `rx?, ry?` |
| `SvgCircleElement` | `type: "circle"`, `cx, cy, r` |
| `SvgEllipseElement` | `type: "ellipse"`, `cx, cy, rx, ry` |
| `SvgLineElement` | `type: "line"`, `x1, y1, x2, y2` |
| `SvgPolylineElement` | `type: "polyline"`, `points: [number,number][]` |
| `SvgPolygonElement` | `type: "polygon"`, `points: [number,number][]` |
| `SvgTextElement` | `type: "text"`, `x, y, content`, `fontSize?, fontFamily?, fontWeight?, textAnchor?` |
| `SvgGroupElement` | `type: "g"`, `children: SvgElement[]` (recursive) |

All element types extend `SvgCoreAttributes` (`id?`, `className?`, `style?`, `transform?`)
and `SvgPresentationAttributes` (`fill?`, `stroke?`, `opacity?`, etc.).

---

## SVG Element → GeoJSON Mapping

| SVG Element | GeoJSON Geometry | Notes |
|---|---|---|
| `rect` | `Polygon` | 5-point closed ring (4 corners + close) |
| `circle` | `Polygon` | 64-point approximation |
| `ellipse` | `Polygon` | 64-point approximation with separate `rx`/`ry` |
| `line` | `LineString` | 2 points |
| `polyline` | `LineString` | N points |
| `polygon` | `Polygon` | Input points + first appended as last |
| `path` (closed) | `Polygon` | Contains `Z` command |
| `path` (open) | `LineString` | No `Z` command |
| `text` | `Point` | At text anchor `[x, y]` |
| `g` (group) | `GeometryCollection` | Recursive over children |

---

## Errors

| Code | Meaning |
|---|---|
| `invalid-xml` | XML parse failed (malformed SVG, no `<svg>` root) |
| `invalid-input` | Schema validation failed or path `d` string is invalid |
| `unsupported-svg-element` | Element type cannot be converted to GeoJSON |
