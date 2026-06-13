/**
 * km-imports — Parse raw strings and objects into typed internal structures.
 *
 * Supports GeoJSON, SVG, WKT, OpenLayers, and artboard snapshots.
 * Every importer returns `ImportResult<T>` — a success with optional warnings
 * or a failure with a structured error code.
 *
 * The WKT importer is also available as a km-plugins Plugin (`wktImporterPlugin`),
 * demonstrating the formats-as-plugins pattern for future format extensions.
 *
 * @packageDocumentation
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  ImportErrorCode,
  ImportError,
  ImportWarning,
  ImportResult,
  DetectedFormat,
  AutoImportResult,
} from './types';

// ─── Functions ────────────────────────────────────────────────────────────────
export { importGeoJson } from './importGeoJson';
export { importSvg } from './importSvg';
export { importWkt } from './importWkt';
export { importOpenLayers } from './importOpenLayers';
export { importArtboardSnapshot } from './importArtboardSnapshot';
export { detectImportFormat } from './detectImportFormat';
export { importAuto } from './importAuto';

// ─── WKT plugin (formats-as-plugins pattern) ──────────────────────────────────
export type { WktImporterApi } from './wktPlugin';
export { wktImporterPlugin, WKT_IMPORTER_PLUGIN_ID } from './wktPlugin';
