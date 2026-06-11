# km-shared Changelog

## [0.1.0]

- Initial release.
- Added `Result<T>` and `ResultError` types.
- Added Zod v4 schema utility functions: `nonEmptyString`, `positiveNumber`,
  `nonNegativeNumber`, `finiteNumber`, `uuid`, `unixTimestampMs`, `pointSchema`,
  `latLngSchema`, `colorHexSchema`, `percentSchema`, `opacitySchema`,
  `boundingBoxSchema`, `withDefault`.
- Added `$AnyZodObject` and `$AnyZodType` structural types for IDE-safe library exports.
