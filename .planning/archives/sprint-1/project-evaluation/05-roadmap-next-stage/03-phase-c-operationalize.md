# Phase C — Operationalize (≈ 8–12 h)

1. `git init`, GitHub monorepo, branch protection. — 1 h
2. CI workflow (matrix Node 18/20/22) + conformance script + IDE-hang regression fixture. — 3–4 h
3. Coverage thresholds in vitest configs; raise tests where below bar. — 2–3 h
4. Changesets; first npm publish of all packages at `0.x`. — 2–3 h
5. CHANGELOG entries for everything shipped. — 1 h

**Exit:** a stranger can `npm install km-geoboard` and CI blocks any regression.
