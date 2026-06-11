# 5. Build-output / exports-map mismatch

`km-shared`'s tsup writes `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` — but its
`package.json` `exports` map points to `dist/esm/index.js`, `dist/cjs/index.cjs`,
`dist/types/index.d.ts`, which are **empty directories**. This is why `km-imports` and
`km-svg` tests cannot resolve their siblings. The same divergence pattern (declared paths
≠ produced paths) must be checked in every package.
