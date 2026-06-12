---
'@komeilm76/km-artboard': patch
---

Fix `createArtboard` crashing with `ReferenceError: crypto is not defined` on
Node 18: global WebCrypto only exists from Node 19. Id generation now uses
`globalThis.crypto.randomUUID` when available and a Math.random-based RFC 4122
v4 fallback otherwise, keeping the documented `engines.node >= 18` promise.
