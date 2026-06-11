# Capacity constraints to respect

- The no-DOM / no-renderer rule is the project's superpower (isomorphism) — extensions
  must live in adapter or app layers, never in core packages.
- Shapefile **write**, raster **rendering** in core, and live-collaboration infrastructure
  are out of scope by design; they would import the complexity the architecture
  deliberately excludes.
- Solo-maintainer bandwidth: every Tier 1 item is sized to be one project-book chapter
  (4–8 h) — keep using that format for new work.
