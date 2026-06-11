# P7. Demo / playground app (`apps/playground`)

A minimal Vite app: paste SVG or GeoJSON → see parsed structure → export to another
format; a tiny artboard canvas using `km-artboard` math; a tile/projection inspector using
`km-map`. It is **not** part of the published packages (the no-DOM rule stands) — it lives
in `apps/`, proves the isomorphic claim in a real browser, and doubles as the docs site's
live demo backend.
