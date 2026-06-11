# km-geojson

GeoJSON types and validation for RFC 7946.  
Parse, validate, and construct GeoJSON data in any environment.

## Installation

```bash
npm install km-geojson zod
```

## Usage

```ts
import { parseGeoJson, featureFromGeometry, getGeometryBoundingBox } from 'km-geojson';

const result = parseGeoJson({ type: 'Point', coordinates: [-0.1276, 51.5074] });
if (result.success) {
  console.log(result.data); // GeoJsonPoint
}
```

See [help.md](./help.md) for the full API reference.

## License

MIT
