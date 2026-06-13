import { describe, it, expect } from 'vitest';
import { importWkt } from '../src/importWkt';
import { detectImportFormat } from '../src/detectImportFormat';
import { importAuto } from '../src/importAuto';
import { createPluginRegistry } from '@komeilm76/km-plugins';
import { wktImporterPlugin, WKT_IMPORTER_PLUGIN_ID } from '../src/wktPlugin';
import type { WktImporterApi } from '../src/wktPlugin';

// ─── detectImportFormat — WKT detection ──────────────────────────────────────

describe('detectImportFormat — wkt', () => {
  it('detects POINT', () => {
    expect(detectImportFormat('POINT (10 20)')).toBe('wkt');
  });

  it('detects LINESTRING', () => {
    expect(detectImportFormat('LINESTRING (0 0, 1 1)')).toBe('wkt');
  });

  it('detects POLYGON', () => {
    expect(detectImportFormat('POLYGON ((0 0, 1 0, 1 1, 0 0))')).toBe('wkt');
  });

  it('detects MULTIPOINT', () => {
    expect(detectImportFormat('MULTIPOINT (0 0, 1 1)')).toBe('wkt');
  });

  it('detects MULTILINESTRING', () => {
    expect(detectImportFormat('MULTILINESTRING ((0 0, 1 1))')).toBe('wkt');
  });

  it('detects MULTIPOLYGON', () => {
    expect(detectImportFormat('MULTIPOLYGON (((0 0, 1 0, 1 1, 0 0)))')).toBe('wkt');
  });

  it('detects GEOMETRYCOLLECTION', () => {
    expect(detectImportFormat('GEOMETRYCOLLECTION (POINT (0 0))')).toBe('wkt');
  });

  it('detects case-insensitively', () => {
    expect(detectImportFormat('point (10 20)')).toBe('wkt');
    expect(detectImportFormat('Point (10 20)')).toBe('wkt');
  });

  it('detects Z modifier', () => {
    expect(detectImportFormat('POINT Z (10 20 30)')).toBe('wkt');
  });

  it('detects ZM modifier', () => {
    expect(detectImportFormat('POINT ZM (10 20 30 40)')).toBe('wkt');
  });

  it('detects EMPTY geometry', () => {
    expect(detectImportFormat('POINT EMPTY')).toBe('wkt');
  });

  it('does NOT detect a plain JSON string as wkt', () => {
    expect(detectImportFormat('{"type":"FeatureCollection","features":[]}')).toBe('geojson');
  });

  it('does NOT detect arbitrary text as wkt', () => {
    expect(detectImportFormat('hello world')).toBe('unknown');
  });
});

// ─── importWkt — core parser ──────────────────────────────────────────────────

describe('importWkt', () => {
  // ── Success cases ──────────────────────────────────────────────────────────

  it('parses POINT', () => {
    const r = importWkt('POINT (10 20)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.type).toBe('FeatureCollection');
    expect(r.data.features).toHaveLength(1);
    expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20] });
    expect(r.warnings).toEqual([]);
  });

  it('parses POINT Z (3-D)', () => {
    const r = importWkt('POINT Z (10 20 30)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20, 30] });
  });

  it('parses LINESTRING', () => {
    const r = importWkt('LINESTRING (0 0, 1 1, 2 2)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('LineString');
    if (geom?.type !== 'LineString') return;
    expect(geom.coordinates).toHaveLength(3);
  });

  it('parses POLYGON', () => {
    const r = importWkt('POLYGON ((0 0, 4 0, 4 4, 0 4, 0 0))');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('Polygon');
    if (geom?.type !== 'Polygon') return;
    expect(geom.coordinates[0]).toHaveLength(5);
  });

  it('parses POLYGON with hole', () => {
    const r = importWkt('POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0), (2 2, 4 2, 4 4, 2 4, 2 2))');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('Polygon');
    if (geom?.type !== 'Polygon') return;
    expect(geom.coordinates).toHaveLength(2);
  });

  it('parses MULTIPOINT', () => {
    const r = importWkt('MULTIPOINT (0 0, 1 1, 2 2)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('MultiPoint');
    if (geom?.type !== 'MultiPoint') return;
    expect(geom.coordinates).toHaveLength(3);
  });

  it('parses MULTILINESTRING', () => {
    const r = importWkt('MULTILINESTRING ((0 0, 1 1), (2 2, 3 3))');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('MultiLineString');
    if (geom?.type !== 'MultiLineString') return;
    expect(geom.coordinates).toHaveLength(2);
  });

  it('parses MULTIPOLYGON', () => {
    const r = importWkt('MULTIPOLYGON (((0 0, 1 0, 1 1, 0 0)), ((2 2, 3 2, 3 3, 2 2)))');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('MultiPolygon');
    if (geom?.type !== 'MultiPolygon') return;
    expect(geom.coordinates).toHaveLength(2);
  });

  it('parses GEOMETRYCOLLECTION', () => {
    const r = importWkt('GEOMETRYCOLLECTION (POINT (0 0), LINESTRING (0 0, 1 1))');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('GeometryCollection');
    if (geom?.type !== 'GeometryCollection') return;
    expect(geom.geometries).toHaveLength(2);
  });

  it('is case-insensitive (lowercase keyword)', () => {
    const r = importWkt('point (10 20)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.features[0]?.geometry?.type).toBe('Point');
  });

  // ── Warning: M ordinates dropped ──────────────────────────────────────────

  it('returns m-dropped warning for POINT M and drops the measure', () => {
    const r = importWkt('POINT M (10 20 99)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]?.code).toBe('m-dropped');
    // No third coordinate — measure dropped
    expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20] });
  });

  it('emits m-dropped warning only once even for multiple M positions', () => {
    const r = importWkt('LINESTRING M (0 0 1, 1 1 2, 2 2 3)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.warnings.filter((w) => w.code === 'm-dropped')).toHaveLength(1);
  });

  it('parses POINT ZM: keeps Z, drops M, emits one m-dropped warning', () => {
    const r = importWkt('POINT ZM (10 20 30 99)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.warnings[0]?.code).toBe('m-dropped');
    expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20, 30] });
  });

  // ── Warning: EMPTY geometries ──────────────────────────────────────────────

  it('returns empty FeatureCollection and warning for POINT EMPTY', () => {
    const r = importWkt('POINT EMPTY');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.features).toHaveLength(0);
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]?.code).toBe('empty-geometry');
  });

  it('skips EMPTY members in GEOMETRYCOLLECTION', () => {
    const r = importWkt('GEOMETRYCOLLECTION (POINT (1 2), LINESTRING EMPTY)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    const geom = r.data.features[0]?.geometry;
    expect(geom?.type).toBe('GeometryCollection');
    if (geom?.type !== 'GeometryCollection') return;
    // LINESTRING EMPTY is skipped
    expect(geom.geometries).toHaveLength(1);
    expect(r.warnings[0]?.code).toBe('empty-geometry');
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  it('returns empty-input for null', () => {
    const r = importWkt(null);
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('empty-input');
  });

  it('returns empty-input for undefined', () => {
    const r = importWkt(undefined);
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('empty-input');
  });

  it('returns empty-input for empty string', () => {
    const r = importWkt('');
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('empty-input');
  });

  it('returns invalid-wkt for non-string non-null input', () => {
    const r = importWkt(42);
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('invalid-wkt');
  });

  it('returns invalid-wkt for garbage string', () => {
    const r = importWkt('not wkt at all');
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('invalid-wkt');
  });

  it('returns invalid-wkt for truncated geometry', () => {
    const r = importWkt('POINT (10');
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('invalid-wkt');
  });

  it('returns invalid-wkt for trailing garbage', () => {
    const r = importWkt('POINT (10 20) GARBAGE');
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('invalid-wkt');
  });

  it('includes position in error for syntax errors', () => {
    const r = importWkt('POINT (10 20) BAD');
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(typeof r.error.position).toBe('number');
  });
});

// ─── importAuto — WKT dispatch ────────────────────────────────────────────────

describe('importAuto — wkt dispatch', () => {
  it('dispatches POINT to wkt importer', () => {
    const r = importAuto('POINT (10 20)');
    expect(r.format).toBe('wkt');
    expect(r.result.success).toBe(true);
    if (!r.result.success) return;
    expect(r.result.data.features[0]?.geometry?.type).toBe('Point');
  });

  it('dispatches POLYGON to wkt importer', () => {
    const r = importAuto('POLYGON ((0 0, 1 0, 1 1, 0 0))');
    expect(r.format).toBe('wkt');
    expect(r.result.success).toBe(true);
  });

  it('dispatches invalid WKT string as wkt (with failure result)', () => {
    // detectImportFormat sees 'POINT' prefix → wkt; importWkt then fails on syntax
    const r = importAuto('POINT (broken');
    expect(r.format).toBe('wkt');
    expect(r.result.success).toBe(false);
  });
});

// ─── wktImporterPlugin ────────────────────────────────────────────────────────

describe('wktImporterPlugin', () => {
  it('has the correct id and name', () => {
    expect(wktImporterPlugin.id).toBe('com.komeilm76.km-imports.wkt');
    expect(wktImporterPlugin.name).toBe('WKT Importer');
    expect(WKT_IMPORTER_PLUGIN_ID).toBe('com.komeilm76.km-imports.wkt');
  });

  it('registers in a PluginRegistry without error', () => {
    const registry = createPluginRegistry();
    const result = registry.register(wktImporterPlugin);
    expect(result.success).toBe(true);
  });

  it('exposes importWkt through the registry API', () => {
    const registry = createPluginRegistry();
    registry.register(wktImporterPlugin);

    const api = registry.getApi<WktImporterApi>(WKT_IMPORTER_PLUGIN_ID);
    expect(api).not.toBeNull();

    const r = api!.importWkt('POINT (10 20)');
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.features[0]?.geometry).toEqual({ type: 'Point', coordinates: [10, 20] });
  });

  it('plugin API importWkt returns correct failure result', () => {
    const registry = createPluginRegistry();
    registry.register(wktImporterPlugin);

    const api = registry.getApi<WktImporterApi>(WKT_IMPORTER_PLUGIN_ID);
    const r = api!.importWkt(null);
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('empty-input');
  });

  it('cannot be registered twice', () => {
    const registry = createPluginRegistry();
    registry.register(wktImporterPlugin);
    const second = registry.register(wktImporterPlugin);
    expect(second.success).toBe(false);
    if (second.success) return;
    expect(second.error.code).toBe('already-registered');
  });

  it('can be unregistered and re-registered', () => {
    const registry = createPluginRegistry();
    registry.register(wktImporterPlugin);
    const unregResult = registry.unregister(WKT_IMPORTER_PLUGIN_ID);
    expect(unregResult.success).toBe(true);
    const reregResult = registry.register(wktImporterPlugin);
    expect(reregResult.success).toBe(true);
  });

  it('is gone after registry.reset()', () => {
    const registry = createPluginRegistry();
    registry.register(wktImporterPlugin);
    registry.reset();
    expect(registry.has(WKT_IMPORTER_PLUGIN_ID)).toBe(false);
  });
});
