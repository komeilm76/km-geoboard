/**
 * importAuto — detect the format of a raw input and run the appropriate importer.
 */

import type { AutoImportResult, ImportError } from './types';
import { detectImportFormat } from './detectImportFormat';
import { importGeoJson } from './importGeoJson';
import { importSvg } from './importSvg';
import { importOpenLayers } from './importOpenLayers';
import { importArtboardSnapshot } from './importArtboardSnapshot';
import { importWkt } from './importWkt';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Detects the format of the raw input and runs the appropriate importer.
 *
 * @param raw - Raw string or object.
 * @returns AutoImportResult — the detected format and the import result.
 */
export function importAuto(raw: string | unknown): AutoImportResult {
  const format = detectImportFormat(raw);

  switch (format) {
    case 'geojson':
      return { format: 'geojson', result: importGeoJson(raw) };

    case 'svg': {
      // detectImportFormat guarantees raw is a string when format === 'svg'
      const svgString = typeof raw === 'string' ? raw : String(raw);
      return { format: 'svg', result: importSvg(svgString) };
    }

    case 'wkt':
      return { format: 'wkt', result: importWkt(raw) };

    case 'openlayers':
      return { format: 'openlayers', result: importOpenLayers(raw) };

    case 'artboard-snapshot':
      return { format: 'artboard-snapshot', result: importArtboardSnapshot(raw) };

    case 'unknown':
    default: {
      const error: ImportError = {
        code: 'unknown-format',
        message: 'Could not detect the format of the input',
      };
      return { format: 'unknown', result: { success: false, error } };
    }
  }
}
