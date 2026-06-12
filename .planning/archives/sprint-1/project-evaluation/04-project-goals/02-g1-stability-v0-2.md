# G1 — Stability (v0.2): "everything green"
- `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod` succeeds from a
  fresh clone with only Node ≥18 + pnpm.
- 0 failing tests (~400 currently written), 0 Zod identifiers in any `dist/*.d.ts`.
- One normative standards document; conformance script passes for all packages.
- Target: within 1–2 working sessions (see roadmap Phase A).
