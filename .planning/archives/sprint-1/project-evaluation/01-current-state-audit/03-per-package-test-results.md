# 3. Per-package test results (after the install fix)

| Package | Result | Detail |
|---|---|---|
| `km-shared` | ✅ 62/62 | |
| `km-plugins` | ✅ 43/43 | |
| `exports` | ✅ 93/93 | passes only because it **duplicates** all sibling types locally instead of importing them |
| `km-artboard` | ❌ 2 failed / 41 | `snapArtboardToGrid` produces `-0` where tests expect `+0` (`Object.is` inequality) |
| `km-geojson` | ❌ 2 suites failed / 19 passed | committed CommonJS `.js` artifacts inside `src/` are picked up as ES modules → `exports is not defined in ES module scope` |
| `km-svg` | ❌ 1 suite failed / 19 passed | cannot resolve `km-geojson/dist/cjs/index.cjs` — sibling was never built |
| `km-map` | ❌ 2 failed / 126 passed | test tolerance issues: haversine London→Paris expected <343 000 m, got 343 934 m; Mercator Y precision 10.2 m vs 0.5 m tolerance |
| `km-imports` | ❌ all 4 suites failed | cannot resolve `km-artboard`, `km-geojson`, `km-svg` — their `exports` maps point to unbuilt `dist/` |

**Total: ~400 tests written; 5 of 8 packages currently red, none for deep algorithmic reasons.**
