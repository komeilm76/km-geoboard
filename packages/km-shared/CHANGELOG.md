# km-shared Changelog

## 0.1.2

### Patch Changes

- b3fd5fc: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.

## 0.1.1

### Patch Changes

- 31dd255: docs: expanded READMEs for all packages — full API tables (functions, signatures, options, error codes), type references, runnable examples (all type-checked against source), error-handling guidance, and cross-package links. npm users now get complete usage docs without leaving the package page.

## [0.1.0]

- Initial release.
- Added `Result<T>` and `ResultError` types.
- Added Zod v4 schema utility functions: `nonEmptyString`, `positiveNumber`,
  `nonNegativeNumber`, `finiteNumber`, `uuid`, `unixTimestampMs`, `pointSchema`,
  `latLngSchema`, `colorHexSchema`, `percentSchema`, `opacitySchema`,
  `boundingBoxSchema`, `withDefault`.
- Added `$AnyZodObject` and `$AnyZodType` structural types for IDE-safe library exports.
