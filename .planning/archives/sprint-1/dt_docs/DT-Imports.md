# DT-Imports

> Import / parsing pipeline — reading GeoJSON, SVG, and OpenLayers formats into internal data structures.

---

## Overview

The imports package provides **parsing services** — pure functions that accept raw string or object input and return validated, typed internal representations.

There are no file system calls, no HTTP requests, no clipboard access, and no DOM.  
This package handles only the **data transformation** step:

```
Raw input string / object
        ↓
   Parse & validate
        ↓
Typed internal structure (Artboard, GeoJsonFeatureCollection, SvgDocument, ...)
```

The mechanism by which the raw data arrives (file picker, paste event, fetch, drag-and-drop) is entirely the consumer's concern.

---

## Supported Input Formats

| Format | Input Type | Returns |
|---|---|---|
| GeoJSON | `string` or `unknown` object | `GeoJsonFeatureCollection` |
| SVG | `string` (XML) | `SvgDocument` |
| OpenLayers JSON | `string` or `unknown` object | `GeoJsonFeatureCollection` |
| Artboard snapshot | `string` (JSON) or `unknown` | `Artboard[]` |

---

## Types

### `ImportResult<T>`

All import functions return this union:

```ts
type ImportResult<T> =
  | { success: true;  data: T; warnings: ImportWarning[] }
  | { success: false; error: ImportError; warnings: ImportWarning[] };

type ImportError = {
  code: ImportErrorCode;
  message: string;
  /** Line or character position in the source, if applicable */
  position?: number;
};

type ImportWarning = {
  code: string;
  message: string;
  /** The element or feature that triggered the warning */
  context?: string;
};

type ImportErrorCode =
  | "empty-input"
  | "invalid-json"
  | "invalid-xml"
  | "unknown-format"
  | "schema-mismatch"
  | "unsupported-geometry-type"
  | "unsupported-svg-element";
```

`warnings` is always present even on success.  
For example, a GeoJSON file with an unsupported custom `type` field produces a warning but still parses successfully.

---

## Functions

### `importGeoJson`

Parses a GeoJSON string or plain object into a `GeoJsonFeatureCollection`.

```ts
/**
 * Parses any valid GeoJSON value and normalizes it into a FeatureCollection.
 *
 * - If the input is a FeatureCollection, it is returned as-is after validation.
 * - If the input is a Feature, it is wrapped in a FeatureCollection.
 * - If the input is a Geometry, it is wrapped in a Feature (with null properties)
 *   and then in a FeatureCollection.
 *
 * @param raw - A JSON string or a plain object.
 * @returns ImportResult<GeoJsonFeatureCollection>
 *
 * @example
 * const result = importGeoJson('{"type":"FeatureCollection","features":[...]}');
 * if (result.success) console.log(result.data.features.length);
 */
function importGeoJson(raw: string | unknown): ImportResult<GeoJsonFeatureCollection>
```

### `importSvg`

Parses an SVG XML string into a typed `SvgDocument`.

```ts
/**
 * Parses an SVG XML string into a structured SvgDocument.
 *
 * Supported elements: path, rect, circle, ellipse, line, polyline, polygon, text, g.
 * Unsupported elements (defs, use, symbol, image, etc.) are ignored with a warning.
 *
 * @param svgString - Raw SVG XML string.
 * @returns ImportResult<SvgDocument>
 *
 * @example
 * const result = importSvg('<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80"/></svg>');
 * if (result.success) console.log(result.data.elements.length); // 1
 */
function importSvg(svgString: string): ImportResult<SvgDocument>
```

### `importOpenLayers`

Parses an OpenLayers vector source JSON string.  
OpenLayers exports GeoJSON FeatureCollections, sometimes with a `crs` property added at the root.  
This function handles the OpenLayers variants and returns a standard `GeoJsonFeatureCollection`.

```ts
/**
 * Parses an OpenLayers vector source JSON string or object.
 *
 * Handles both standard GeoJSON and OpenLayers-extended GeoJSON
 * (with top-level "crs" or projection metadata fields).
 *
 * @param raw - JSON string or plain object from an OpenLayers source.
 * @returns ImportResult<GeoJsonFeatureCollection>
 */
function importOpenLayers(raw: string | unknown): ImportResult<GeoJsonFeatureCollection>
```

### `importArtboardSnapshot`

Parses a saved artboard snapshot (produced by the artboard package's serialization).

```ts
/**
 * Parses a JSON string or object produced by the artboard package.
 *
 * @param raw - JSON string or plain object.
 * @returns ImportResult<Artboard[]>
 */
function importArtboardSnapshot(raw: string | unknown): ImportResult<Artboard[]>
```

---

## Format Auto-Detection

When the format is unknown, use `detectImportFormat`:

```ts
type DetectedFormat = "geojson" | "svg" | "openlayers" | "artboard-snapshot" | "unknown";

/**
 * Heuristically detects the format of a raw input string or object.
 *
 * Detection logic:
 * - Starts with "<" and contains "svg" → "svg"
 * - Object with type "FeatureCollection" or "Feature" → "geojson"
 * - Object with type "FeatureCollection" and a top-level "crs" field → "openlayers"
 * - Object with an array of items each having "origin" and "size" → "artboard-snapshot"
 * - Otherwise → "unknown"
 *
 * @param raw - Raw string or object.
 * @returns DetectedFormat
 */
function detectImportFormat(raw: string | unknown): DetectedFormat
```

### `importAuto`

Detects the format and imports in one step.

```ts
type AutoImportResult =
  | { format: "geojson";            result: ImportResult<GeoJsonFeatureCollection> }
  | { format: "svg";                result: ImportResult<SvgDocument> }
  | { format: "openlayers";         result: ImportResult<GeoJsonFeatureCollection> }
  | { format: "artboard-snapshot";  result: ImportResult<Artboard[]> }
  | { format: "unknown";            result: { success: false; error: ImportError } };

/**
 * Detects the format of the raw input and runs the appropriate importer.
 *
 * @param raw - Raw string or object.
 * @returns AutoImportResult — the detected format and the import result.
 */
function importAuto(raw: string | unknown): AutoImportResult
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

## Normalization Behavior

All importers normalize data to internal conventions:

- GeoJSON `Feature.properties = null` is converted to `{}`.
- SVG `transform` attribute is parsed into a `SvgTransform` array.
- OpenLayers `crs` field is stripped and recorded in `ImportWarning` if it differs from EPSG:4326.
- `id` fields are always normalized to `string` (numeric IDs are stringified).

---

## Error Codes

| Code | Meaning |
|---|---|
| `empty-input` | Input is null, undefined, empty string, or empty object |
| `invalid-json` | JSON.parse failed |
| `invalid-xml` | XML parse failed |
| `unknown-format` | Auto-detection could not identify the format |
| `schema-mismatch` | Detected format but Zod validation failed |
| `unsupported-geometry-type` | A geometry type is not in the supported set |
| `unsupported-svg-element` | An SVG element type cannot be parsed |

---

## File Location

```
packages/
  imports/
    src/
      types.ts              ← ImportResult, ImportError, ImportWarning, DetectedFormat
      schemas.ts
      importGeoJson.ts
      importSvg.ts
      importOpenLayers.ts
      importArtboardSnapshot.ts
      detectImportFormat.ts
      importAuto.ts
      index.ts
    tests/
      importGeoJson.test.ts
      importSvg.test.ts
      importAuto.test.ts
    help.md
```
