# km-shared

Shared types and Zod schema utilities for km-geoboard packages.

## Install

```bash
pnpm add km-shared zod
```

## Quick start

```ts
import type { Result, ResultError } from 'km-shared';
import { nonEmptyString, finiteNumber, pointSchema } from 'km-shared';
import { z } from 'zod';

// Use Result<T> as your function return type
function createLayer(name: string): Result<{ id: string; name: string }> {
  const parsed = z.object({ name: nonEmptyString() }).safeParse({ name });
  if (!parsed.success) {
    return { success: false, error: { code: 'invalid-input', message: parsed.error.message } };
  }
  return { success: true, data: { id: crypto.randomUUID(), name: parsed.data.name } };
}

// Build schemas using shared utilities
const PointSchema = pointSchema();
const CoordSchema = z.object({ x: finiteNumber(), y: finiteNumber() });
```

See [help.md](./help.md) for full API reference.
