# km-geoboard — API Reference

## Overview

`@komeilm76/km-geoboard` is the umbrella package for the km-geoboard suite.
It has no API of its own — it re-exports the full public surface of all eight
packages under namespaces. See each package's own `help.md` for the detailed
API reference.

## Installation

```bash
pnpm add @komeilm76/km-geoboard zod
```

Zod must be installed alongside this package (it is a peer dependency of the
underlying packages).

---

## Namespaces

| Namespace | Package | API reference |
|---|---|---|
| `shared` | `@komeilm76/km-shared` | `packages/km-shared/help.md` |
| `artboard` | `@komeilm76/km-artboard` | `packages/km-artboard/help.md` |
| `geojson` | `@komeilm76/km-geojson` | `packages/km-geojson/help.md` |
| `svg` | `@komeilm76/km-svg` | `packages/km-svg/help.md` |
| `map` | `@komeilm76/km-map` | `packages/km-map/help.md` |
| `imports` | `@komeilm76/km-imports` | `packages/km-imports/help.md` |
| `exports` | `@komeilm76/km-exports` | `packages/km-exports/help.md` |
| `plugins` | `@komeilm76/km-plugins` | `packages/km-plugins/help.md` |

## Usage

```typescript
import { artboard, svg, geojson, map, imports, exports, plugins } from '@komeilm76/km-geoboard';

const board = artboard.createArtboard({
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 800, y: 600 },
  name: 'Main',
});
```

Types are accessible through the same namespaces:

```typescript
import type { artboard } from '@komeilm76/km-geoboard';
type Board = artboard.Artboard;
```

## Integration tests

This package hosts the cross-package integration suite in
`tests/integration/`, covering the round-trip contracts:

- SVG → GeoJSON → export → reparse (svg, geojson, exports)
- GeoJSON import → export → reimport deep-equal (imports, exports, geojson)
- Artboard snapshot export → reimport (artboard, imports)
- Tile math round-trips (map)
- `importAuto` format routing for all formats and malformed input (imports)
- Plugin registry wrapping an importer (plugins, imports)
