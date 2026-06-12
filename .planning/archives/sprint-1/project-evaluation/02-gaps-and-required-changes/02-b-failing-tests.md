# B. Failing tests to fix (after A)

| Package | Failure | Required change |
|---|---|---|
| `km-artboard` | `-0` vs `+0` in `snapArtboardToGrid` (2 tests) | Normalize negative zero in the implementation (`x + 0` or `Object.is(v, -0) ? 0 : v`). Implementation bug, not test bug — `-0` would also serialize oddly downstream |
| `km-map` | haversine London→Paris off by ~0.3 % vs test bound; Mercator Y off by 10 m vs 0.5 m tolerance | Re-derive the expected constants and use **relative** tolerances (e.g. ±0.5 %). The math is likely fine; the hard-coded expectations are too tight / from a different reference ellipsoid |
| `km-svg`, `km-imports` | Resolution failures | Disappear automatically once A3/A4 give real built outputs; additionally consider Vitest `alias`/workspace config so tests run against sibling **source**, removing the build-order coupling during development |
