# 4. The most serious single defect: Zod leak in `km-shared`

`km-shared` builds, but line 1 of the generated `dist/index.d.ts` is:

```ts
import { z } from 'zod';
```

with public signatures like `declare function nonEmptyString(): z.ZodString;`.

This is precisely the failure mode `zod_hang.md` (941 lines) and `DT-Zod.md` exist to
prevent — the project's own `check-zod` gate fails on its own foundational package.
Root cause: the `zodUtils.ts` factory functions have **no explicit return types**, so tsc
infers `z.ZodString`/`z.ZodObject<…>` into the declaration file. Every downstream package
inherits this leak.
