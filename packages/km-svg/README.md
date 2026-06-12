# km-svg

> SVG document and path parsing, path serialization, and SVG → GeoJSON conversion.

```bash
npm install @komeilm76/km-svg
```

```ts
import { parseSvgDocument, parseSvgPath, serializeSvgPath, svgToGeoJson } from '@komeilm76/km-svg';

const doc = parseSvgDocument(svgString);
if (doc.success) {
  const geo = svgToGeoJson(doc.data);
}
```

All parsers return the shared `Result<T>` union from `km-shared` — no exceptions thrown at boundaries.

See `help.md` for the full API and the .planning/archives/sprint-1/project-book chapter `03-svg` for design rationale.

## License

MIT
