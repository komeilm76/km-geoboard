# Page 05-05 — Import Auto and Artboard Snapshot

## Summary
Implements `importArtboardSnapshot`, `detectImportFormat`, and `importAuto`.
See full specification in `05-03 (import-svg)/TASK.md` §"Page 05-05".

## Dependencies
- Page 05-02, 05-03, 05-04

## Outputs

| File | Purpose |
|---|---|
| `packages/imports/src/importArtboardSnapshot.ts` | Validates artboard JSON arrays |
| `packages/imports/src/detectImportFormat.ts` | Heuristic format detection |
| `packages/imports/src/importAuto.ts` | Unified entry point |
| `packages/imports/tests/importAuto.test.ts` | Tests |
