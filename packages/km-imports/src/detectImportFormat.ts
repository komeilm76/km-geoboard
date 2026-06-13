/**
 * detectImportFormat — heuristically identify the format of a raw input.
 */

import type { DetectedFormat } from './types';

// ─── WKT keyword pattern ──────────────────────────────────────────────────────

/**
 * Matches strings that begin with a WKT geometry keyword (case-insensitive),
 * followed by optional dimension modifiers (Z / M / ZM) and then whitespace or '('.
 * Used by detectImportFormat to recognise WKT before falling through to JSON.
 */
const WKT_PREFIX_RE =
  /^(GEOMETRYCOLLECTION|MULTILINESTRING|MULTIPOLYGON|MULTIPOINT|LINESTRING|POLYGON|POINT)(\s+(ZM|Z|M))?[\s(]/i;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Heuristically detects the format of a raw input string or object.
 *
 * Detection logic (in priority order):
 * 1. String starting with `"<"` and containing `"svg"` (case-insensitive) → `"svg"`
 * 2. String whose first token is a WKT geometry keyword → `"wkt"`
 * 3. Object with `type: "FeatureCollection"` and a top-level `"crs"` field → `"openlayers"`
 * 4. Object with `type: "FeatureCollection"` or `type: "Feature"` (no crs) → `"geojson"`
 * 5. Array of objects each having `origin` and `size` → `"artboard-snapshot"`
 * 6. Otherwise → `"unknown"`
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

    // WKT: first token is a recognised geometry keyword
    if (WKT_PREFIX_RE.test(trimmed)) {
      return 'wkt';
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
