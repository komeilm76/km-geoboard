# YOUR-PACKAGE-NAME — Changelog

---

## v0.1.1 — Release flow alignment

- Added `hooks.before:init` to `.release-it.json` to automatically run `fix → build → test` before every release.
- Replaced the manual `auto-release` script with a clean `ship` script (`release-it`) — pre-steps are now delegated to release-it hooks.

---

## v0.1.0 — Initial release

- First public version.
