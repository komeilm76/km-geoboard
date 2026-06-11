# P8. Repository & publishing model

Recommendation: **one monorepo** `komeilm76/km-geoboard` (matches `km-shared`/`km-plugins`
URLs), all packages published independently to npm from it via changesets. Update the six
package.jsons that still point to per-package repos. Polyrepo splitting can happen later
if a package gains an independent life; starting split multiplies CI and standards drift —
which is exactly the failure mode this audit found.
