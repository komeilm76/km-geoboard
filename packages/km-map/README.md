# km-map

> Pure coordinate math and geographic utilities. No map renderer required.

## Install

```bash
npm install @komeilm76/km-map
```

## Quick Start

```ts
import { latLngToMercator, haversineDistance, latLngToTile } from '@komeilm76/km-map';

const london = { lat: 51.5074, lng: -0.1276 };
const paris  = { lat: 48.8566, lng: 2.3522 };

console.log(latLngToMercator(london)); // { x: -14214.6, y: 6711531.8 }
console.log(haversineDistance(london, paris)); // ~340,000 m
console.log(latLngToTile(london, 10)); // { x: 511, y: 340, z: 10 }
```

See [help.md](./help.md) for the full API reference.
