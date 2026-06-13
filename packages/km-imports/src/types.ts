/**
 * Import pipeline TypeScript types.
 *
 * This file contains ONLY type definitions — no Zod imports, no runtime code.
 * Zod schemas live in the individual importer files.
 * This separation ensures declaration files never carry a Zod import (see .planning/zod_hang.md).
 */

import type { GeoJsonFeatureCollection } from '@komeilm76/km-geojson';
import type { SvgDocument } from '@komeilm76/km-svg';
import type { Artboard } from '@komeilm76/km-artboard';

// ─── Error & Warning ──────────────────────────────────────────────────────────

/**
 * Machine-readable error codes for all import failures.
 */
export type ImportErrorCode =
  | 'empty-input'
  | 'invalid-json'
  | 'invalid-xml'
  | 'invalid-wkt'
  | 'unknown-format'
  | 'schema-mismatch'
  | 'unsupported-geometry-type'
  | 'unsupported-svg-element';

/**
 * A structured import error — returned on the failure branch of ImportResult.
 */
export type ImportError = {
  code: ImportErrorCode;
  message: string;
  /** Line or character position in the source, if applicable. */
  position?: number;
};

/**
 * A non-fatal import warning — returned alongside success data.
 * Warnings do not prevent a successful import.
 */
export type ImportWarning = {
  code: string;
  message: string;
  /** The element or feature that triggered the warning. */
  context?: string;
};

// ─── ImportResult ─────────────────────────────────────────────────────────────

/**
 * Discriminated union returned by every import function.
 * `warnings` is always present on both branches — empty `[]` when there are none.
 *
 * NOTE: This is distinct from `Result<T>` in `km-shared`.
 * `ImportResult<T>` always carries `warnings` on both success and failure branches.
 */
export type ImportResult<T> =
  | { success: true;  data: T;            warnings: ImportWarning[] }
  | { success: false; error: ImportError; warnings: ImportWarning[] };

// ─── Format Detection ─────────────────────────────────────────────────────────

/**
 * The set of formats that `detectImportFormat` can identify.
 */
export type DetectedFormat =
  | 'geojson'
  | 'svg'
  | 'wkt'
  | 'openlayers'
  | 'artboard-snapshot'
  | 'unknown';

// ─── AutoImportResult ─────────────────────────────────────────────────────────

/**
 * The union returned by `importAuto`.
 * Each branch carries `format` (the detected format) and `result` (the import outcome).
 *
 * The `"unknown"` branch carries only a failure result — no importer can be dispatched.
 */
export type AutoImportResult =
  | { format: 'geojson';           result: ImportResult<GeoJsonFeatureCollection> }
  | { format: 'svg';               result: ImportResult<SvgDocument> }
  | { format: 'wkt';               result: ImportResult<GeoJsonFeatureCollection> }
  | { format: 'openlayers';        result: ImportResult<GeoJsonFeatureCollection> }
  | { format: 'artboard-snapshot'; result: ImportResult<Artboard[]> }
  | { format: 'unknown';           result: { success: false; error: ImportError } };
