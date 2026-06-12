# Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Zod minor versions change `_zod` internals, breaking the structural types | Medium | Pin peer range (`>=4.4 <5`), add a CI canary that compiles the structural types against the newest Zod nightly |
| The two standards docs keep drifting | High (already happened) | One normative doc + conformance script in CI (P4) |
| Test expectations vs. geodesy reference values disagree again | Medium | Document the reference (WGS84 sphere radius used) in DT-Map and derive constants in-test |
| Solo-maintainer stall | Medium | Phases are small with hard exits; the project-book habit already fits this — keep using it for Phases A–D |
| npm name availability for `km-*` | Low | Verify all 9 names before Phase C publish; fall back to a scope if taken |
