# assigned_sources — inbox for new material from Komeil

Drop **any file or folder** here (specs, notes, task lists, screenshots, exported docs, ideas — any format). This is the input channel of the `.planning` flow.

## What the agent MUST do with this folder (rule 10)

1. **At session start, before any other work:** read everything in this folder (this README and `.gitkeep` excepted).
2. **Merge:** update the proper `.planning/` files from it — `rules.md`, `targets.md`, `features.md`, `backlog.md`, `tasks.md`, `issues.md`, `risks.md`, `hints.md`, `checklists.md` — creating new files/sprints if the content warrants it.
3. **Archive:** move each processed source into `archives/sprint-<current>/assigned_sources/<name>/` together with an `_ARCHIVE-REPORT.md` listing exactly what was merged and where.
4. **Never delete, never lose.** If something doesn't fit an existing file, create a new tracked file and register it in `.planning/README.md` — don't drop it.

An empty folder (only this README + `.gitkeep`) means: nothing to process.
