# D. Hygiene and completeness

- Root: delete `src/core.ts`, `tests/core.test.ts`, root `tsup.config.ts`,
  `.release-it.json` (template leftovers), and rewrite root `README.md` to describe
  km-geoboard (it still says `YOUR-PACKAGE-NAME`).
- Add `LICENSE` to every package (each whitelists it in `files` but none has one — npm
  publish would silently ship without a license file).
- Add `README.md` to `km-imports` and `km-svg`.
- Unify `tsconfig.test.json` vs `tsconfig.build.json` naming across packages.
- `km-plugins` and `exports` still use the `build/` layout and `auto-release` scripts —
  align with the decided standard.
- Initialize git, create the GitHub repo (`komeilm76/km-geoboard` is already referenced in
  homepage/bugs URLs of `km-shared`/`km-plugins` — the others point at per-package repos;
  decide monorepo-with-one-repo vs polyrepo and make all URLs consistent).
