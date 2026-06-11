# P2. An umbrella package: `km-geoboard`

Add `packages/km-geoboard` — a thin meta-package that depends on all eight and re-exports
their public surfaces under namespaces:

```ts
import { artboard, geojson, svg, map, imports, exports, plugins } from 'km-geoboard';
```

Why: one install for app consumers, one obvious entry point for docs and demos, the
natural home for **integration tests**, and it makes the monorepo's purpose visible on npm.
Individual packages remain installable for tree-shaking-conscious users.
