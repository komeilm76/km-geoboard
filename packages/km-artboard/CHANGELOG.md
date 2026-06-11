# Changelog — km-artboard

All notable changes to this package are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — Initial release

### Added

**Types** (`src/types.ts`)
- `Point` — `{ x: number; y: number }` canvas coordinate
- `Size` — `{ width: number; height: number }` dimensions
- `Artboard` — full artboard entity with `id`, `name`, `origin`, `size`, `startPoint`, `endPoint`, `createdAt`
- `CreateArtboardInput` — input for `createArtboard` with optional `name`, `id`, `minSize`
- `CreateArtboardResult` — discriminated union `{ success: true; artboard } | { success: false; reason }`
- `ResizeArtboardInput` — partial origin/size override input
- `MoveArtboardInput` — artboard + delta vector
- `SnapArtboardInput` — artboard + gridSize + snap mode

**Schemas** (`src/schemas.ts`)
- `CreateArtboardInputSchema` — Zod v4 schema with defaults for `name` and `minSize`
- `ArtboardSchema` — full entity schema with type-divergence guard

**Functions**
- `createArtboard` — creates a normalized artboard from two canvas points; handles all drag directions; validates via Zod
- `resizeArtboard` — returns new artboard with partial origin/size overrides; applies `minSize` guard
- `moveArtboard` — translates artboard by a delta vector; pure, infallible
- `artboardToRect` — converts artboard to `[x, y, width, height]` tuple
- `artboardFromRect` — reverse of `artboardToRect`; round-trip contract
- `artboardContainsPoint` — inclusive boundary point-in-rect test
- `artboardsOverlap` — AABB overlap test; touching edges count as overlap
- `snapArtboardToGrid` — snaps origin and size to grid; supports `round`, `floor`, `ceil` modes

**Tests**
- Full Vitest test suites for every function
- 15+ cases for `createArtboard` covering all 4 drag directions, defaults, invalid inputs
- Edge-case coverage for negative coordinates, zero values, boundary conditions
