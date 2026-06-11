# P4. Single normative standard + a conformance script

- Merge `PACKAGE_STANDARDS.md` and `DT-Flexibility.md` decisions (see doc 02 §C) into one
  normative document; the other defers to it.
- Add `scripts/check-conformance.mjs` run in CI that asserts, for every package:
  name matches `km-*`; `exports` map paths exist after build; `files` whitelist entries
  exist; `LICENSE` + `README.md` + `help.md` + `CHANGELOG.md` present; no `.js` in `src/`;
  no `zod` import in `dist/`. This turns the standards doc from prose into a gate.
