# .planning — project notebook & single source of truth for work state

> **MANDATORY:** Every developer or AI agent working on this repo must read this file
> first, work only on items not in ✅ state, and **update item statuses before ending
> a session.** New planning/docs files go in `.planning/`, never in the repo root.

## Status legend

| Icon | State |
|---|---|
| ⏳ | todo — not started |
| 🔄 | in-progress |
| 🧊 | blocked (note the blocker) |
| ✅ | done |
| ❌ | dropped / won't do |

## Tracking files

| File | Purpose |
|---|---|
| [tasks.md](./tasks.md) | Active work items (the "what's next" list) |
| [backlog.md](./backlog.md) | Ordered queue of upcoming work (roadmap phases C/D) |
| [issues.md](./issues.md) | Bugs / blockers |
| [features.md](./features.md) | New-capability ideas (Tiers 1–3) not yet committed to backlog |
| [targets.md](./targets.md) | Milestones G1–G4 (v0.2 → v1.0) + success metrics |
| [risks.md](./risks.md) | Risk register with mitigations |
| [rules.md](./rules.md) | Laws of the repo — non-negotiable |
| [checklists.md](./checklists.md) | Session, definition-of-done, pre-release checklists |
| [hints.md](./hints.md) | Practical know-how (git setup, sandbox quirks, commands, sizing) |

## Folders (the flow)

| Folder | Role |
|---|---|
| [assigned_sources/](./assigned_sources/README.md) | **Inbox.** Komeil drops files/folders here; the agent merges them into `.planning` at session start, then archives them with a report. |
| [archives/](./archives/README.md) | **Read-only history**, organized by sprint. Not a priority for review — consult only when an open item points there. Every item has an `_ARCHIVE-REPORT.md`. |

## Live reference documents

| Item | Purpose |
|---|---|
| [PACKAGE_STANDARDS.md](./PACKAGE_STANDARDS.md) | **Normative** package standards (decision table at top) |
| [zod_hang.md](./zod_hang.md) | Why Zod types must never reach published `.d.ts` (Rules 1–6) |

Archived references (sprint-1): [project-book/](./archives/sprint-1/project-book/_ARCHIVE-REPORT.md) · [dt_docs/](./archives/sprint-1/dt_docs/_ARCHIVE-REPORT.md) · [project-evaluation/](./archives/sprint-1/project-evaluation/_ARCHIVE-REPORT.md)

## Workflow (every session)

1. **Inbox first:** if `assigned_sources/` has content, merge it into the files above, then archive it with a report (rule 10).
2. Read `tasks.md` → pick the first non-✅ item (respect 🧊 blockers).
3. Mark it 🔄, do the work per `rules.md` + `checklists.md`.
4. When verified (build/test/lint green), mark ✅ with date. Pull the next item from `backlog.md` into `tasks.md` if the list is empty.
5. New problems → `issues.md`. New ideas → `features.md`. New dangers → `risks.md`.
6. **Sprint close** (when a coherent body of work is fully ✅): move its finished folders/files into `archives/sprint-<N>/` with reports — but only after every still-live item inside them has been merged into the tracking files. **Merge before move; no data is ever lost.**

## Data-safety law

Nothing is deleted in this system. Content moves only in one direction:
`assigned_sources/` → `.planning` tracking files → (when done) `archives/sprint-N/` — and every move leaves a report behind.
