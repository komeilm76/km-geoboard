# km-imports

> Parse raw strings and objects into typed internal structures — GeoJSON, SVG, OpenLayers, and artboard snapshots.

```bash
npm install @komeilm76/km-imports
```

```ts
import { importGeoJson, detectFormat } from '@komeilm76/km-imports';

const result = importGeoJson(rawString);
if (result.success) console.log(result.data);
```

All importers return the shared `Result<T>` union from `km-shared` — no exceptions thrown at boundaries.

See `help.md` for the full API and the project-book chapter `05-imports` for design rationale.

## License

MIT
