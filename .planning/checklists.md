# Checklists

## Session start (human or AI agent)

- [ ] Read `.planning/README.md` + `tasks.md`; pick first non-✅ item
- [ ] If AI in Cowork sandbox: read `hints.md` (file-write + git quirks) before touching files

## Definition of done (per task)

- [ ] `pnpm -r build` green
- [ ] `pnpm -r test` green
- [ ] `pnpm -r check-zod` green
- [ ] `pnpm -r lint` green
- [ ] Changeset added if user-visible
- [ ] Status updated in `tasks.md` (✅ + date)

## New package

- [ ] Folder `packages/km-<name>`, package name `@komeilm76/km-<name>`
- [ ] Conforms to PACKAGE_STANDARDS.md table (tsup flat dist, tsconfig noEmit, exports map)
- [ ] types.ts free of Zod imports (zod_hang.md); schemas via `$SchemaOf<T>`
- [ ] Vitest config aliases workspace deps to sibling `src/`
- [ ] Re-exported from umbrella `packages/km-geoboard` + integration coverage

## Pre-release

- [ ] All Phase C tasks ✅, CI green on GitHub Actions
- [ ] `pnpm changeset version` → review bumps → `pnpm changeset publish`
- [ ] Tag pushed; CHANGELOG entries present
