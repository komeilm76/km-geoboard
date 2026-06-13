/**
 * wktPlugin — km-plugins Plugin wrapper for the WKT importer.
 *
 * Validates the "formats-as-plugins" pattern (F-005): each format importer
 * can be shipped as a self-contained plugin that exposes a typed API through
 * the km-plugins registry.
 *
 * @example
 * ```typescript
 * import { createPluginRegistry } from '@komeilm76/km-plugins';
 * import { wktImporterPlugin } from '@komeilm76/km-imports';
 * import type { WktImporterApi } from '@komeilm76/km-imports';
 *
 * const registry = createPluginRegistry();
 * registry.register(wktImporterPlugin);
 *
 * const api = registry.getApi<WktImporterApi>(wktImporterPlugin.id);
 * const result = api?.importWkt('POINT (10 20)');
 * ```
 */

import type { Plugin, PluginDepsMap } from '@komeilm76/km-plugins';
import type { GeoJsonFeatureCollection } from '@komeilm76/km-geojson';
import { importWkt } from './importWkt';
import type { ImportResult } from './types';

// ─── Plugin API type ──────────────────────────────────────────────────────────

/**
 * Public API exposed by the WKT importer plugin.
 */
export type WktImporterApi = {
  /**
   * Parse a WKT string into a GeoJsonFeatureCollection.
   * See `importWkt` for full documentation.
   */
  importWkt: (raw: string | unknown) => ImportResult<GeoJsonFeatureCollection>;
};

// ─── Plugin definition ────────────────────────────────────────────────────────

/**
 * Plugin ID constant — use when retrieving the API from a registry.
 *
 * @example
 * ```typescript
 * const api = registry.getApi<WktImporterApi>(WKT_IMPORTER_PLUGIN_ID);
 * ```
 */
export const WKT_IMPORTER_PLUGIN_ID = 'com.komeilm76.km-imports.wkt' as const;

/**
 * A km-plugins Plugin that exposes `importWkt` through the plugin registry.
 *
 * Register it once with a `PluginRegistry`; consumers retrieve it by ID
 * via `registry.getApi<WktImporterApi>(WKT_IMPORTER_PLUGIN_ID)`.
 */
export const wktImporterPlugin: Plugin<WktImporterApi> = {
  id: WKT_IMPORTER_PLUGIN_ID,
  name: 'WKT Importer',
  version: '1.0.0',
  setup(_deps: PluginDepsMap): WktImporterApi {
    return { importWkt };
  },
};
