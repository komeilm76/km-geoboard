# Hints (practical know-how)

## Commands

- `pnpm install && pnpm -r build && pnpm -r test && pnpm -r check-zod && pnpm -r lint` — full green check (Node ≥18, never Bun).
- Tests don't need prior builds — vitest aliases workspace deps to sibling `src/`.

## Git

- **`main` is PROTECTED (since 2026-06-15, T-020, `protect-main` ruleset):** no direct pushes — GitHub rejects them with "Changes must be made through a pull request" + "4 of 4 required status checks". All changes to `main` go via a branch + PR: `git push origin HEAD:refs/heads/<branch>`, then open/merge the PR (required checks: `verify (18/20/22)` + `consumer-smoke`; force-push & deletion blocked). The agent CANNOT merge PRs (api.github.com blocked) — push the branch and hand Komeil the compare/PR URL to merge.

- **Komeil's machine (since 2026-06-15):** a real in-folder `.git` lives in the project on Windows, tracking `origin/main`. Set up in place via `git init -b main` → `git remote add origin <url>` → `git fetch origin` → `git reset --mixed origin/main` → `git branch --set-upstream-to=origin/main main` (working files preserved). Komeil sees diffs / pushes directly with normal git.
- **Cowork sandbox:** the mount allows CREATING files under `.git` but DENIES unlink/modify, so git cannot be operated in the folder from the sandbox (and stray `.git` junk can't be cleaned — Komeil removes it on Windows). The agent uses an EXTERNAL git dir: clone `--no-checkout` into sandbox `$HOME`, set `core.worktree` to the mount path; a `--no-checkout` clone leaves the index empty (status shows everything deleted+untracked) → run `git reset --mixed HEAD` once to repopulate the index without touching files. The two git dirs (Komeil's in-folder, agent's external) are independent.
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
