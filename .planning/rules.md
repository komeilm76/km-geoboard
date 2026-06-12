# Rules (laws of the repo)

1. **`.planning/` first.** Read `.planning/README.md` before any work; update statuses before ending a session. Planning/docs files never go in the repo root.
2. **`PACKAGE_STANDARDS.md` is normative.** The decision table at its top wins over any other doc. pnpm + Node ≥18 only (no Bun). Flat `dist/` via tsup, `noEmit: true` tsconfigs, zod peerDep ≥4.4.0.
3. **zod_hang.md Rules 1–6 are mandatory** for all schema code: published `.d.ts` must never import Zod. `pnpm -r check-zod` must stay green.
4. **Naming:** packages are scoped `@komeilm76/km-*` (folders `packages/km-*`); `publishConfig.access=public` on every package.
5. **Definition of done:** `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod && pnpm -r lint` all green, plus a status update here.
6. **Versioning via Changesets** — every user-visible change ships with a changeset.
7. **GitHub `komeilm76/km-geoboard` is the source of truth**; commit and push completed work to `main`.
8. **Architecture guardrails (non-goals).** No rendering, DOM, UI framework, canvas/WebGL, or map-engine dependency inside core packages — engines (OpenLayers/MapLibre/Leaflet) are consumers or peer deps of *adapter* packages only. No exception-based APIs; no class hierarchies beyond the justified registry. Shapefile **write**, raster **rendering** in core, and live-collaboration infra are out of scope by design.
9. **Automate every rule.** A rule without CI enforcement decays into documentation — when adding a rule, add/extend a script or CI check that enforces it. (Lesson of the sprint-1 audit: every defect found was an un-executed verification step.)
10. **.planning flow.** At session start, process `assigned_sources/` before any other work (merge → archive with report). `archives/` is read-only history. Every archive move carries a report file. **Merge before move — no data may ever be lost.**
