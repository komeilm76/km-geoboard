# DT-SVG

> SVG element types, attribute schemas (Zod v4), and SVG-to-GeoJSON conversion.

---

## Overview

This package models **SVG content as structured data**.  
It provides Zod schemas for SVG elements and their attributes, functions to parse SVG XML strings into typed objects, and a conversion pipeline to produce GeoJSON from SVG geometry.

There is no DOM, no `document.createElement`, no browser rendering.  
SVG content is treated as a **data format** — strings that carry geometry and style information.

---

## SVG as Data

An SVG document is parsed into a plain structured object tree:

```
SvgDocument
├── viewBox: SvgViewBox
├── width: string | undefined
├── height: string | undefined
└── elements: SvgElement[]
    ├── SvgPathElement
    ├── SvgRectElement
    ├── SvgCircleElement
    ├── SvgEllipseElement
    ├── SvgLineElement
    ├── SvgPolylineElement
    ├── SvgPolygonElement
    ├── SvgTextElement
    ├── SvgGroupElement (recursive)
    └── SvgUseElement
```

---

## Core Types

### `SvgViewBox`

```ts
type SvgViewBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};
```

### `SvgLength`

```ts
type SvgLengthUnit = "px" | "pt" | "pc" | "mm" | "cm" | "in" | "em" | "ex" | "rem" | "vw" | "vh" | "%" | "";

type SvgLength = {
  value: number;
  unit: SvgLengthUnit;
};
```

### `SvgColor`

```ts
type SvgColor =
  | { type: "hex";   value: string }        // "#ff0000"
  | { type: "rgb";   r: number; g: number; b: number }
  | { type: "rgba";  r: number; g: number; b: number; a: number }
  | { type: "named"; value: string }        // "red", "none", "currentColor"
  | { type: "none" };
```

### `SvgTransform`

```ts
type SvgTransformOperation =
  | { type: "translate"; tx: number; ty: number }
  | { type: "scale";     sx: number; sy: number }
  | { type: "rotate";    angle: number; cx?: number; cy?: number }
  | { type: "skewX";     angle: number }
  | { type: "skewY";     angle: number }
  | { type: "matrix";    a: number; b: number; c: number; d: number; e: number; f: number };

type SvgTransform = SvgTransformOperation[];
```

### `SvgPresentationAttributes`

Common presentation attributes shared by all visible elements:

```ts
type SvgPresentationAttributes = {
  fill?: SvgColor;
  fillOpacity?: number;          // 0–1
  fillRule?: "nonzero" | "evenodd";
  stroke?: SvgColor;
  strokeWidth?: SvgLength;
  strokeOpacity?: number;        // 0–1
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel" | "arcs" | "miter-clip";
  strokeDasharray?: number[];
  strokeDashoffset?: number;
  strokeMiterlimit?: number;
  opacity?: number;              // 0–1
  display?: string;
  visibility?: "visible" | "hidden" | "collapse";
  clipPath?: string;
  clipRule?: "nonzero" | "evenodd";
  mask?: string;
  filter?: string;
  pointerEvents?: string;
};
```

### `SvgCoreAttributes`

```ts
type SvgCoreAttributes = {
  id?: string;
  className?: string;
  style?: string;               // inline CSS string (not parsed)
  transform?: SvgTransform;
  "data-*"?: Record<string, string>; // custom data attributes
};
```

---

## Element Types

### `SvgPathElement`

```ts
type SvgPathElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "path";
  d: string;       // SVG path data string
};
```

Path data command types (for parsed path data):

```ts
type SvgPathCommand =
  | { cmd: "M" | "m"; x: number; y: number }
  | { cmd: "L" | "l"; x: number; y: number }
  | { cmd: "H" | "h"; x: number }
  | { cmd: "V" | "v"; y: number }
  | { cmd: "C" | "c"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { cmd: "S" | "s"; x2: number; y2: number; x: number; y: number }
  | { cmd: "Q" | "q"; x1: number; y1: number; x: number; y: number }
  | { cmd: "T" | "t"; x: number; y: number }
  | { cmd: "A" | "a"; rx: number; ry: number; rotation: number; largeArc: 0 | 1; sweep: 0 | 1; x: number; y: number }
  | { cmd: "Z" | "z" };
```

### `SvgRectElement`

```ts
type SvgRectElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;   // corner radius x
  ry?: number;   // corner radius y
};
```

### `SvgCircleElement`

```ts
type SvgCircleElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
};
```

### `SvgEllipseElement`

```ts
type SvgEllipseElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};
```

### `SvgLineElement`

```ts
type SvgLineElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
```

### `SvgPolylineElement`

```ts
type SvgPolylineElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "polyline";
  points: [number, number][];
};
```

### `SvgPolygonElement`

```ts
type SvgPolygonElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "polygon";
  points: [number, number][];
};
```

### `SvgTextElement`

```ts
type SvgTextElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "text";
  x: number;
  y: number;
  content: string;
  fontSize?: SvgLength;
  fontFamily?: string;
  fontWeight?: string;
  textAnchor?: "start" | "middle" | "end";
};
```

### `SvgGroupElement`

```ts
type SvgGroupElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: "g";
  children: SvgElement[];
};
```

### `SvgElement` (union)

```ts
type SvgElement =
  | SvgPathElement
  | SvgRectElement
  | SvgCircleElement
  | SvgEllipseElement
  | SvgLineElement
  | SvgPolylineElement
  | SvgPolygonElement
  | SvgTextElement
  | SvgGroupElement;
```

### `SvgDocument`

```ts
type SvgDocument = {
  viewBox?: SvgViewBox;
  width?: SvgLength;
  height?: SvgLength;
  elements: SvgElement[];
};
```

---

## Functions

### `parseSvgDocument`

Parses an SVG XML string into a structured `SvgDocument`.

```ts
function parseSvgDocument(svgString: string): Result<SvgDocument>
```

### `parseSvgPath`

Parses an SVG path `d` attribute string into an array of `SvgPathCommand` objects.

```ts
function parseSvgPath(d: string): Result<SvgPathCommand[]>
```

### `serializeSvgPath`

Converts an array of `SvgPathCommand` objects back into an SVG path `d` string.

```ts
function serializeSvgPath(commands: SvgPathCommand[]): string
```

---

## SVG to GeoJSON Conversion

Converting SVG geometry to GeoJSON requires **geographic metadata** — the SVG coordinate system is dimensionless, but GeoJSON requires real-world longitude/latitude values.

### `SvgGeoMeta`

```ts
/**
 * Metadata that maps SVG canvas coordinates to geographic coordinates.
 * Used to convert SVG shapes into GeoJSON with real-world positions.
 */
type SvgGeoMeta = {
  /**
   * The SVG viewBox (or bounding box of the SVG canvas).
   * Defines the SVG coordinate space.
   */
  svgBounds: { minX: number; minY: number; maxX: number; maxY: number };

  /**
   * The geographic bounding box that the SVG canvas maps onto.
   * [west, south, east, north] in degrees.
   */
  geoBounds: [number, number, number, number];

  /**
   * Coordinate reference system identifier.
   * @default "EPSG:4326"
   */
  crs?: string;
};
```

### `svgPointToGeoPosition`

Converts a single SVG `[x, y]` coordinate to a GeoJSON `Position` `[lng, lat]`.

```ts
function svgPointToGeoPosition(
  point: [number, number],
  meta: SvgGeoMeta
): [number, number]
```

Linear interpolation formula:

```
lng = geoBounds.west + (x - svgBounds.minX) / svgBounds.width  * (geoBounds.east  - geoBounds.west)
lat = geoBounds.north - (y - svgBounds.minY) / svgBounds.height * (geoBounds.north - geoBounds.south)
```

Note: SVG `y` is inverted relative to geographic latitude (SVG y increases downward; latitude increases upward).

### `svgElementToGeoJsonFeature`

Converts a single SVG element into a GeoJSON Feature.

```ts
function svgElementToGeoJsonFeature(
  element: SvgElement,
  meta: SvgGeoMeta
): Result<GeoJsonFeature>
```

Conversion mapping:

| SVG Element | GeoJSON Geometry |
|---|---|
| `rect` | `Polygon` (4-point closed ring) |
| `circle` | `Polygon` (approximated with N-point ring, default 64 sides) |
| `ellipse` | `Polygon` (approximated) |
| `line` | `LineString` (2 points) |
| `polyline` | `LineString` |
| `polygon` | `Polygon` (closed) |
| `path` | `Polygon` or `MultiPolygon` (if `Z` commands produce multiple rings) or `LineString` |
| `text` | `Point` (at anchor x, y) |
| `g` (group) | `GeometryCollection` of all children |

SVG presentation attributes are stored in `Feature.properties`.

### `svgDocumentToFeatureCollection`

Converts an entire `SvgDocument` into a GeoJSON `FeatureCollection`.

```ts
function svgDocumentToFeatureCollection(
  document: SvgDocument,
  meta: SvgGeoMeta
): Result<GeoJsonFeatureCollection>
```

---

## File Location

```
packages/
  svg/
    src/
      types.ts              ← All SVG TypeScript types
      schemas.ts            ← Zod schemas
      parseSvgDocument.ts
      parseSvgPath.ts
      serializeSvgPath.ts
      svgToGeoJson.ts       ← Conversion pipeline
      index.ts
    tests/
    help.md
```
