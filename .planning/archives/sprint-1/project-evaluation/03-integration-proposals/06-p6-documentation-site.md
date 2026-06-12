# P6. Documentation site (already designed in DT-Logics)

`DT-Logics.md` specifies the structure (uniform `help.md`, machine-readable JSDoc,
JSON-serializable examples). Implement it as `apps/docs`:
TypeDoc → API reference; `help.md` files → guides; Astro or Nextra; live examples via
Sandpack (everything is pure functions on plain data — ideal for in-browser demos).
A docs site is the single highest-leverage artifact for making the packages adoptable.
