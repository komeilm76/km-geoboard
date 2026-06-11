/**
 * detectImportFormat — heuristically identify the format of a raw input.
 */

import type { DetectedFormat } from './types';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Heuristically detects the format of a raw input string or object.
 *
 * Detection logic (in priority order):
 * 1. String starting with `"<"` and containing `"svg"` (case-insensitive) → `"svg"`
 * 2. Object with `type: "FeatureCollection"` and a top-level `"crs"` field → `"openlayers"`
 * 3. Object with `type: "FeatureCollection"` or `type: "Feature"` (no crs) → `"geojson"`
 * 4. Array of objects each having `origin` and `size` → `"artboard-snapshot"`
 * 5. Otherwise → `"unknown"`
 *
 * @param raw - Raw string or object.
 * @returns DetectedFormat
 */
export function detectImportFormat(raw: string | unknown): DetectedFormat {
  // ── String inputs ──────────────────────────────────────────────────────────
  if (typeof raw === 'string') {
    const trimmed = raw.trim();

    // SVG: starts with '<' and contains 'svg' somewhere
    if (trimmed.startsWith('<') && /svg/i.test(trimmed)) {
      return 'svg';
    }

    // Try to parse as JSON and re-run detection
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return detectImportFormat(parsed);
    } catch {
      return 'unknown';
    }
  }

  // ── Object inputs ──────────────────────────────────────────────────────────
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;

    if (obj['type'] === 'FeatureCollection') {
      // OpenLayers adds a top-level 'crs' field
      if ('crs' in obj) return 'openlayers';
      return 'geojson';
    }

    if (obj['type'] === 'Feature') {
      return 'geojson';
    }

    // Any GeoJSON geometry type
    const GEO_TYPES = ['Point', 'MultiPoint', 'LineString', 'MultiLineString',
                       'Polygon', 'MultiPolygon', 'GeometryCollection'];
    if (typeof obj['type'] === 'string' && GEO_TYPES.includes(obj['type'])) {
      return 'geojson';
    }
  }

  // ── Array inputs ───────────────────────────────────────────────────────────
  if (Array.isArray(raw) && raw.length > 0) {
    const allHaveOriginAndSize = raw.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        'origin' in (item as object) &&
        'size' in (item as object),
    );
    if (allHaveOriginAndSize) return 'artboard-snapshot';
  }

  return 'unknown';
}
