# @komeilm76/km-imports

Parse raw strings and objects into typed internal structures — GeoJSON, SVG, OpenLayers payloads, and artboard snapshots. Includes format auto-detection, so you can hand it arbitrary user input (file drop, paste, API response) and get back a typed result.

Every importer returns `ImportResult<T>` — a success with optional warnings, or a failure with a structured error code. **Nothing throws.**

## Install

```bash
npm install @komeilm76/km-imports zod
# or
pnpm add @komeilm76/km-imports zod
```

> `zod` (≥ 4.4.0) is a peer dependency — install it alongside.

## Quick start

```ts
import { importAuto, importGeoJson, detectImportFormat } from '@komeilm76/km-imports';

// Don't know what the user gave you? Auto-detect and import in one call:
const auto = importAuto(rawStringOrObject);

switch (auto.format) {
  case 'geojson':
  case 'openlayers':
    if (auto.result.success) useFeatures(auto.result.data); // GeoJsonFeatureCollection
    break;
  case 'svg':
    if (auto.result.success) useSvg(auto.result.data);      // SvgDocument
    break;
  case 'artboard-snapshot':
    if (auto.result.success) useBoards(auto.result.data);   // Artboard[]
    break;
  case 'unknown':
    console.error(auto.result.error.message);
    break;
}

// Know the format already? Call the specific importer:
const r = importGeoJson('{"type":"FeatureCollection","features":[]}');
if (r.success) {
  console.log(r.data.features.length);
  r.warnings.forEach(w => console.warn(w.code, w.message)); // non-fatal issues
} else {
  console.error(r.error.code); // e.g. 'invalid-json', 'schema-mismatch'
}
```

## API

| Function | Input | Success data | Description |
|---|---|---|---|
| `importAuto(raw)` | `string \| unknown` | per detected format | Detect format, dispatch to the right importer |
| `detectImportFormat(raw)` | `string \| unknown` | — | Returns `'geojson' \| 'svg' \| 'openlayers' \| 'artboard-snapshot' \| 'unknown'` without importing |
| `importGeoJson(raw)` | JSON string or object | `GeoJsonFeatureCollection` | Validates against RFC 7946 schemas; bare geometries/features are wrapped into a collection |
| `importSvg(svgString)` | SVG XML string | `SvgDocument` | Parses into a typed element tree |
| `importOpenLayers(raw)` | OL-style GeoJSON payload | `GeoJsonFeatureCollection` | Accepts the OpenLayers `crs` convention |
| `importArtboardSnapshot(raw)` | snapshot JSON | `Artboard[]` | Re-imports artboards exported by km-exports |

## Types

### `ImportResult<T>`

```ts
type ImportResult<T> =
  | { success: true;  data: T;            warnings: ImportWarning[] }
  | { success: false; error: ImportError; warnings: ImportWarning[] };
```

`warnings` is always present on **both** branches (empty array when none). This is the difference from the plain `Result<T>` in km-shared — imports can succeed while still reporting recoverable issues (e.g. a skipped unsupported element).

### `ImportError`

| Field | Type | Notes |
|---|---|---|
| `code` | `ImportErrorCode` | One of: `'empty-input'`, `'invalid-json'`, `'invalid-xml'`, `'unknown-format'`, `'schema-mismatch'`, `'unsupported-geometry-type'`, `'unsupported-svg-element'` |
| `message` | `string` | Human-readable explanation |
| `position` | `number?` | Line/character position in the source, when known |

### `ImportWarning`

`{ code: string; message: string; context?: string }` — non-fatal; never blocks a successful import.

### `AutoImportResult`

Discriminated union on `format` — each branch carries the matching `ImportResult`:

| `format` | `result` data type |
|---|---|
| `'geojson'` | `GeoJsonFeatureCollection` |
| `'svg'` | `SvgDocument` |
| `'openlayers'` | `GeoJsonFeatureCollection` |
| `'artboard-snapshot'` | `Artboard[]` |
| `'unknown'` | failure only |

## Example — file-drop handler

```ts
import { importAuto } from '@komeilm76/km-imports';

async function onFileDrop(file: File) {
  const text = await file.text();
  const { format, result } = importAuto(text);

  if (!result.success) {
    showToast(`Could not import ${file.name}: ${result.error.message}`);
    return;
  }
  if (result.warnings.length > 0) {
    showToast(`${file.name} imported with ${result.warnings.length} warning(s)`);
  }
  addToProject(format, result.data);
}
```

## Related packages

| Package | Purpose |
|---|---|
| [`@komeilm76/km-geoboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geoboard) | Umbrella package — this API under the `imports` namespace |
| [`@komeilm76/km-exports`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-exports) | The opposite direction — serialize typed data back out |
| [`@komeilm76/km-geojson`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-geojson) / [`km-svg`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-svg) / [`km-artboard`](https://github.com/komeilm76/km-geoboard/tree/main/packages/km-artboard) | The typed structures importers produce |

Full API reference: [help.md](https://github.com/komeilm76/km-geoboard/blob/main/packages/km-imports/help.md)

## License

MIT — [komeilm76](https://github.com/komeilm76)
