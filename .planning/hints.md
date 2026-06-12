# Hints (practical know-how)

## Commands

- `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod && pnpm -r lint` — full green check (Node ≥18, never Bun).
- Tests don't need prior builds — vitest aliases workspace deps to sibling `src/`.

## Git (Cowork sandbox)

- The mount blocks `.git/config` → git database cannot live in this folder. Use an external git dir: clone `--no-checkout` into sandbox `$HOME`, set `core.worktree` to the mount path.
- Auth: PAT in `.env.local` (`GITHUB_TOKEN=…`, gitignored, maintained by Komeil). Push via `https://komeilm76:$GITHUB_TOKEN@github.com/komeilm76/km-geoboard.git`. Never print/commit the token.

## Cowork sandbox file-safety (critical)

- **Never use the Edit/Write tools on an EXISTING file in this folder** — they corrupt it (NUL padding or silent truncation). Rewrite via bash heredoc (`cat > f <<'EOF2'`), `sed -i`, or python. New-file writes are safe. Verify with `tail -c 80`.
- The mount can serve stale copies of files freshly edited on Windows; the Read tool sees the live file.
- pnpm in sandbox: store must be in `$HOME`, `--package-import-method copy`; registry flaky → run installs/builds on Windows side.

## Releasing

- Changesets flow: `pnpm changeset` → `pnpm changeset version` → `pnpm changeset publish` (or release.yml once `NPM_TOKEN` secret is set).

## Sizing & archived references

- Size every new capability as **one project-book chapter (4–8 h)** — solo-maintainer constraint.
- Geodesy reference values (WGS84 sphere radius): see archived `archives/sprint-1/dt_docs/DT-Map.md`; derive constants in-test.
- Finished reference docs live under `.planning/archives/` (low priority — consult only when an open item points there).
