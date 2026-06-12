# Risks (register)

> Source: project-evaluation ch. 05 (archived → `archives/sprint-1/project-evaluation/05-roadmap-next-stage/05-risk-register.md`).

| ID | Risk | Likelihood | Mitigation | Status |
|---|---|---|---|---|
| R-1 | Zod minor versions change `_zod` internals, breaking the structural types | Medium | Pin peer range (`>=4.4 <5`); add CI canary compiling structural types against newest Zod | ✅ peer range pinned + canary-zod CI job (T-018, 2026-06-12) |
| R-2 | Standards docs drift apart | High (already happened once) | One normative doc (rule 2) + conformance enforced in CI (rule 9) | ✅ single doc + check-standards.mjs CI gate (T-019, 2026-06-12) |
| R-3 | Test expectations vs. geodesy reference values disagree | Medium | Reference (WGS84 sphere radius) documented in archived DT-Map; derive constants in-test | ✅ documented |
| R-4 | Solo-maintainer stall | Medium | Small phases with hard exits; one project-book chapter (4–8 h) per capability | ⏳ ongoing discipline |
| R-5 | npm name availability for `km-*` | Low | Already on `@komeilm76` scope; still verify all 9 names before first publish (T-009) | 🔄 scoped; verify at publish |
