# DT-Figma

> Figma design concepts, data model, API, and how they map to this project's types.

---

## Overview

Figma is the design tool that inspires many of this project's data model decisions.  
This document:
1. Summarizes Figma's key concepts relevant to this project.
2. Maps Figma's data model to the project's own types.
3. Identifies which Figma concepts are already covered and which are intentionally out of scope.

This is a **reference document** for developers — it explains what Figma does so that equivalent functions can be designed correctly.

---

## Figma Core Concepts

### Canvas and Frames (≈ Artboards)

In Figma, the infinite canvas holds **Frames** — named rectangular regions.  
A Frame is the equivalent of this project's `Artboard`:

| Figma Frame | This Project |
|---|---|
| `x`, `y` (position) | `Artboard.origin` |
| `width`, `height` | `Artboard.size` |
| `name` | `Artboard.name` |
| `id` | `Artboard.id` |
| `clipsContent` | `ExportFilter.boundingBox` (clip to bounds on export) |

### Layers

Figma layers are a tree of nodes. This project's equivalent is a flat array of `SvgElement[]` per artboard, with `SvgGroupElement` for nesting.

### Node Types

Figma's node types and their project equivalents:

| Figma Node Type | Project Equivalent |
|---|---|
| `FRAME` | `Artboard` |
| `GROUP` | `SvgGroupElement` |
| `VECTOR` / `BOOLEAN_OPERATION` | `SvgPathElement` |
| `RECTANGLE` | `SvgRectElement` |
| `ELLIPSE` | `SvgCircleElement` / `SvgEllipseElement` |
| `LINE` | `SvgLineElement` |
| `POLYGON` | `SvgPolygonElement` |
| `STAR` | `SvgPolygonElement` (approximated) |
| `TEXT` | `SvgTextElement` |
| `COMPONENT` / `INSTANCE` | Plugin extension — not in core |
| `IMAGE` | Not in scope for core library |

### Fill and Stroke (Paint)

Figma calls colors and gradients **paints**. In this project these are covered by `SvgPresentationAttributes`.

| Figma Paint Type | Project Equivalent |
|---|---|
| `SOLID` fill | `SvgColor` |
| `GRADIENT_LINEAR` | Serialized as SVG `<linearGradient>` def reference |
| `GRADIENT_RADIAL` | Serialized as SVG `<radialGradient>` def reference |
| `IMAGE` fill | Out of scope for core |
| Stroke (`strokeWeight`, `strokeAlign`) | `strokeWidth`, `strokeAlign` in `SvgPresentationAttributes` |

### Transform

Figma stores transforms as a 2×3 affine matrix.  
This project represents transforms as an array of `SvgTransformOperation` (translate, scale, rotate, matrix).

Figma matrix `[[a, b, c], [d, e, f]]` maps to the SVG transform `matrix(a, d, b, e, c, f)`.

```ts
// Figma → project conversion
function figmaMatrixToSvgTransform(matrix: [[number, number, number], [number, number, number]]): SvgTransform {
  const [[a, b, c], [d, e, f]] = matrix;
  return [{ type: "matrix", a, b: d, c: b, d: e, e: c, f }];
}
```

### Constraints and Auto Layout

Figma's constraint system (pin left/right/top/bottom, scale) and Auto Layout (flexbox-like) have **no equivalent in this project's core**.  
They are rendering/layout concerns. The core library only records final geometry.

### Components and Instances

Figma's component/instance system has no equivalent in the core library.  
It can be modeled as a **plugin** (see **DT-Plugins**) if needed.

### Prototypes

Figma prototype connections (navigation, animation, transitions) are out of scope for this library.

---

## Figma REST API

### What the API Provides

The [Figma REST API](https://www.figma.com/developers/api) gives read access to:
- File structure and node tree
- Vector paths
- Text content
- Styles
- Component definitions
- Exported images

### Relevant API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /v1/files/:key` | Full file node tree |
| `GET /v1/files/:key/nodes` | Specific nodes by ID |
| `GET /v1/images/:key` | Export nodes as PNG/SVG/PDF |
| `GET /v1/files/:key/components` | All components in a file |
| `GET /v1/files/:key/styles` | All styles |

### Figma Node JSON → Project Types

A Figma `RECTANGLE` node:

```json
{
  "id": "2:5",
  "name": "Hero Banner",
  "type": "RECTANGLE",
  "absoluteBoundingBox": { "x": 100, "y": 200, "width": 800, "height": 400 },
  "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 0, "b": 0, "a": 1 } }],
  "strokes": [],
  "strokeWeight": 0,
  "cornerRadius": 8
}
```

Maps to:

```ts
const element: SvgRectElement = {
  type: "rect",
  id: "2:5",
  x: 100,
  y: 200,
  width: 800,
  height: 400,
  rx: 8,
  ry: 8,
  fill: { type: "rgb", r: 255, g: 0, b: 0 },
  fillOpacity: 1,
};
```

### Figma Vector Paths

Figma exports vector nodes as SVG path `d` strings via the image export endpoint, or as `vectorPaths` arrays in the node JSON.  
`vectorPaths[].data` is a standard SVG path string — compatible with `parseSvgPath()`.

### SVG Export from Figma

Figma's SVG export produces standard SVG XML.  
The `importSvg()` function in **DT-Imports** can parse Figma-exported SVGs directly.

---

## Figma Plugins

Figma plugins run inside a sandboxed environment with access to:
- The current document's node tree via `figma.*` API
- An `<iframe>` UI with postMessage communication

This project's packages can be used **inside a Figma plugin** as utilities:
- `@komeilm76/km-artboard` — compute frame geometries
- `@komeilm76/km-geojson` — export frame layouts as GeoJSON
- `@komeilm76/km-svg` — parse exported SVG into typed data
- `@komeilm76/km-map` — project geographic coordinates onto a frame

All packages work in the browser (Figma plugin sandbox is a browser environment).

---

## Key Differences from Figma

| Figma | This Project |
|---|---|
| Infinite canvas with zoom/pan | Artboards as named coordinate regions |
| Real-time collaborative node tree | Plain serializable JSON data |
| Component library and instances | Plugin system (optional) |
| Vector boolean operations | Not in core (use path unions externally) |
| Auto-Layout (flexbox) | Not in core |
| Prototype flows | Not in scope |
| Inspectable design tokens | `SvgPresentationAttributes` covers colors/sizes |
| Plugins run in sandboxed iframe | This library works in that sandbox |

---

## File Location

```
packages/
  figma/   (optional, if a Figma integration plugin is built)
    src/
      figmaNodeToSvgElement.ts    ← Convert Figma REST API nodes to SvgElement
      figmaMatrixToSvgTransform.ts
      figmaColorToSvgColor.ts
      index.ts
    help.md
```

The `figma` package is **optional** — it exists only if a Figma API integration is being built.  
The core packages have no dependency on it.
