/**
 * km-imports — Parse raw strings and objects into typed internal structures.
 *
 * Supports GeoJSON, SVG, OpenLayers, and artboard snapshots.
 * Every importer returns `ImportResult<T>` — a success with optional warnings
 * or a failure with a structured error code.
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
export { importOpenLayers } from './importOpenLayers';
export { importArtboardSnapshot } from './importArtboardSnapshot';
export { detectImportFormat } from './detectImportFormat';
export { importAuto } from './importAuto';
