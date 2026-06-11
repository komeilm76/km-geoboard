# km-imports

Parse raw strings and objects into typed internal structures.
Supports GeoJSON, SVG, OpenLayers, and artboard snapshots. Every importer
returns `ImportResult<T>` — a success with optional warnings or a failure
with a structured error code.

---

## Overview

The imports package provides **parsing services** — pure functions that accept
raw string or object input and return validated, typed internal representations.

There are no file system calls, no HTTP requests, no clipboard access, and no DOM.
This package handles only the **data transformation** step:

```
Raw input string / object
        ↓
   Parse & validate
        ↓
Typed internal structure (Artboard[], GeoJsonFeatureCollection, SvgDocument, ...)
```

---

## Installation

```bash
npm install @komeilm76/km-imports
```

Zod must be installed as a peer dependency:

```bash
npm install zod
```

---

## Quick Start

Use `importAuto` when the input format is unknown:

```ts
import { importAuto } from '@komeilm76/km-imports';

const raw = '{"type":"FeatureCollection","features":[...]}';
const result = importAuto(raw);

if (result.format === 'geojson' && result.result.success) {
  console.log(result.result.data.features.length);
  console.log(result.result.warnings); // always present, may be []
}
```

---

## Functions

### `importGeoJson(raw)`

Parses any valid GeoJSON value and normalizes it into a `GeoJsonFeatureCollection`.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `string \| unknown` | A JSON string or a plain GeoJSON object |

**Returns:** `ImportResult<GeoJsonFeatureCollection>`

**Normalization:**
- `FeatureCollection` → returned as-is (features normalized)
- `Feature` → wrapped in a `FeatureCollection`
- Any Geometry → wrapped in a `Feature` (empty properties), then a `FeatureCollection`
- `Feature.properties = null` → `{}` (warning emitted)
- Numeric `Feature.id` → string (warning emitted)

```ts
import { importGeoJson } from '@komeilm76/km-imports';

const r = importGeoJson('{"type":"FeatureCollection","features":[...]}');
if (r.success) {
  console.log(r.data.features.length);
  console.log(r.warnings); // normalization warnings, may be []
}
```

---

### `importSvg(svgString)`

Parses an SVG XML string into a typed `SvgDocument`.

| Parameter | Type | Description |
|---|---|---|
| `svgString` | `string` | Raw SVG XML string |

**Returns:** `ImportResult<SvgDocument>`

Supported elements: `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`,
`polygon`, `text`, `g`.

Unsupported elements (`defs`, `use`, `symbol`, `image`, `linearGradient`, etc.)
are silently skipped and produce an `ImportWarning` with
`code: "unsupported-svg-element"`.

```ts
import { importSvg } from '@komeilm76/km-imports';

const r = importSvg('<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80"/></svg>');
if (r.success) {
  console.log(r.data.elements.length); // 1
  console.log(r.warnings);             // [] if no unsupported elements
}
```

---

### `importOpenLayers(raw)`

Parses an OpenLayers vector source JSON string or object.

OpenLayers exports GeoJSON FeatureCollections with an optional top-level `crs`
property. This function strips that field and delegates to `importGeoJson`.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `string \| unknown` | JSON string or plain object from an OpenLayers source |

**Returns:** `ImportResult<GeoJsonFeatureCollection>`

**CRS behavior:**
- If `crs` is absent → no warning
- If `crs` is `"EPSG:4326"` → stripped, no warning
- If `crs` is anything else → stripped, `ImportWarning` with `code: "crs-stripped"` emitted

```ts
import { importOpenLayers } from '@komeilm76/km-imports';

const r = importOpenLayers({
  type: 'FeatureCollection',
  crs: 'EPSG:3857',
  features: [...],
});
if (r.success) {
  // r.warnings[0].code === 'crs-stripped'
  console.log(r.data.features);
}
```

---

### `importArtboardSnapshot(raw)`

Parses a JSON string or object produced by the artboard package.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `string \| unknown` | JSON string or plain object |

**Returns:** `ImportResult<Artboard[]>`

Validates the input as an array of `Artboard` objects using `ArtboardSchema`
from `km-artboard`.

```ts
import { importArtboardSnapshot } from '@komeilm76/km-imports';

const r = importArtboardSnapshot(savedSnapshotJson);
if (r.success) {
  console.log(r.data.length); // number of artboards
}
```

---

### `detectImportFormat(raw)`

Heuristically identifies the format of a raw input.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `string \| unknown` | Any raw input |

**Returns:** `DetectedFormat`

| Format | Detection signal |
|---|---|
| `"svg"` | String starting with `"<"` and containing `"svg"` (case-insensitive) |
| `"geojson"` | Object with `type: "FeatureCollection"` or `type: "Feature"` (no `crs`) |
| `"openlayers"` | Object with `type: "FeatureCollection"` and a top-level `crs` field |
| `"artboard-snapshot"` | Array of objects each having `origin` and `size` |
| `"unknown"` | None of the above |

```ts
import { detectImportFormat } from '@komeilm76/km-imports';

detectImportFormat('<svg>...</svg>');                                // "svg"
detectImportFormat({ type: 'FeatureCollection', features: [] });    // "geojson"
detectImportFormat({ type: 'FeatureCollection', crs: 'EPSG:3857', features: [] }); // "openlayers"
detectImportFormat([{ origin: {...}, size: {...} }]);               // "artboard-snapshot"
detectImportFormat({ foo: 'bar' });                                 // "unknown"
```

---

### `importAuto(raw)`

Detects the format of the raw input and runs the appropriate importer in one step.

| Parameter | Type | Description |
|---|---|---|
| `raw` | `string \| unknown` | Any raw input |

**Returns:** `AutoImportResult`

```ts
type AutoImportResult =
  | { format: 'geojson';           result: ImportResult<GeoJsonFeatureCollection> }
  | { format: 'svg';               result: ImportResult<SvgDocument> }
  | { format: 'openlayers';        result: ImportResult<GeoJsonFeatureCollection> }
  | { format: 'artboard-snapshot'; result: ImportResult<Artboard[]> }
  | { format: 'unknown';           result: { success: false; error: ImportError } };
```

```ts
import { importAuto } from '@komeilm76/km-imports';

const r = importAuto(userPastedContent);

switch (r.format) {
  case 'geojson':
    if (r.result.success) addToMap(r.result.data);
    break;
  case 'svg':
    if (r.result.success) renderSvg(r.result.data);
    break;
  case 'unknown':
    console.error('Unrecognized format:', r.result.error.message);
    break;
}
```

---

## Warnings vs. Errors

| Situation | Type |
|---|---|
| The entire input is invalid or unparseable | `error` (fail) |
| A single feature has an invalid geometry | `warning` (skip feature, continue) |
| An SVG element type is unsupported | `warning` (skip element, continue) |
| A custom property key is unrecognized | `warning` (ignore property, continue) |
| An unknown GeoJSON `type` value | `warning` if other features are valid, else `error` |

---

## Normalization Rules

All importers normalize data to internal conventions:

- `Feature.properties = null` is converted to `{}`
- Numeric `Feature.id` fields are stringified
- OpenLayers `crs` field is stripped and recorded in an `ImportWarning` if it differs from EPSG:4326
- A `Feature` input is wrapped in a `FeatureCollection`
- A `Geometry` input is wrapped in a `Feature` (empty properties) then a `FeatureCollection`

---

## Error Codes

| Code | Meaning |
|---|---|
| `empty-input` | Input is null, undefined, empty string, or empty object |
| `invalid-json` | JSON.parse failed |
| `invalid-xml` | XML parse failed |
| `unknown-format` | Auto-detection could not identify the format |
| `schema-mismatch` | Detected format but validation failed |
| `unsupported-geometry-type` | A geometry type is not in the supported set |
| `unsupported-svg-element` | An SVG element type cannot be parsed |
