import { describe, it, expect } from 'vitest';
import { detectImportFormat } from '../src/detectImportFormat';
import { importArtboardSnapshot } from '../src/importArtboardSnapshot';
import { importAuto } from '../src/importAuto';

// ─── detectImportFormat ───────────────────────────────────────────────────────

describe('detectImportFormat', () => {
  it('detects svg from XML string starting with <', () => {
    expect(detectImportFormat('<svg viewBox="0 0 100 100"></svg>')).toBe('svg');
  });

  it('detects svg case-insensitively', () => {
    expect(detectImportFormat('<SVG></SVG>')).toBe('svg');
  });

  it('detects geojson FeatureCollection (no crs)', () => {
    expect(detectImportFormat({ type: 'FeatureCollection', features: [] })).toBe('geojson');
  });

  it('detects geojson Feature', () => {
    expect(detectImportFormat({ type: 'Feature', geometry: null, properties: {} })).toBe('geojson');
  });

  it('detects geojson geometry (Point)', () => {
    expect(detectImportFormat({ type: 'Point', coordinates: [0, 0] })).toBe('geojson');
  });

  it('detects openlayers (FeatureCollection + crs field)', () => {
    expect(detectImportFormat({ type: 'FeatureCollection', features: [], crs: 'EPSG:3857' })).toBe('openlayers');
  });

  it('detects artboard-snapshot from array with origin and size', () => {
    const snap = [
      { id: '1', name: 'A', origin: { x: 0, y: 0 }, size: { width: 100, height: 100 }, startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 100 }, createdAt: 0 },
    ];
    expect(detectImportFormat(snap)).toBe('artboard-snapshot');
  });

  it('returns unknown for unrecognized input', () => {
    expect(detectImportFormat({ foo: 'bar' })).toBe('unknown');
  });

  it('returns unknown for null', () => {
    expect(detectImportFormat(null)).toBe('unknown');
  });

  it('returns unknown for a number', () => {
    expect(detectImportFormat(42)).toBe('unknown');
  });

  it('returns unknown for empty array', () => {
    expect(detectImportFormat([])).toBe('unknown');
  });

  it('detects geojson from JSON string', () => {
    expect(detectImportFormat(JSON.stringify({ type: 'FeatureCollection', features: [] }))).toBe('geojson');
  });
});

// ─── importArtboardSnapshot ───────────────────────────────────────────────────

describe('importArtboardSnapshot', () => {
  const validArtboard = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Board 1',
    origin: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 200, y: 150 },
    createdAt: 1700000000000,
  };

  it('parses a valid artboard array', () => {
    const r = importArtboardSnapshot([validArtboard]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(1);
      expect(r.data[0]?.name).toBe('Board 1');
      expect(r.warnings).toEqual([]);
    }
  });

  it('parses an empty artboard array', () => {
    const r = importArtboardSnapshot([]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toHaveLength(0);
  });

  it('parses a JSON string', () => {
    const r = importArtboardSnapshot(JSON.stringify([validArtboard]));
    expect(r.success).toBe(true);
  });

  it('returns empty-input for null', () => {
    const r = importArtboardSnapshot(null);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
  });

  it('returns invalid-json for bad string', () => {
    const r = importArtboardSnapshot('not json');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('invalid-json');
  });

  it('returns schema-mismatch for non-artboard array', () => {
    const r = importArtboardSnapshot([{ foo: 'bar' }]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('schema-mismatch');
  });
});

// ─── importAuto dispatch ──────────────────────────────────────────────────────

describe('importAuto', () => {
  it('dispatches to geojson for a FeatureCollection', () => {
    const input = { type: 'FeatureCollection', features: [] };
    const r = importAuto(input);
    expect(r.format).toBe('geojson');
    expect(r.result.success).toBe(true);
  });

  it('dispatches to svg for an SVG string', () => {
    const svg = '<svg viewBox="0 0 100 100"><rect x="0" y="0" width="10" height="10"/></svg>';
    const r = importAuto(svg);
    expect(r.format).toBe('svg');
    expect(r.result.success).toBe(true);
  });

  it('dispatches to openlayers for a FeatureCollection with crs', () => {
    const input = { type: 'FeatureCollection', features: [], crs: 'EPSG:4326' };
    const r = importAuto(input);
    expect(r.format).toBe('openlayers');
    expect(r.result.success).toBe(true);
  });

  it('dispatches to artboard-snapshot for valid artboard array', () => {
    const snap = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Board',
        origin: { x: 0, y: 0 },
        size: { width: 200, height: 150 },
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 200, y: 150 },
        createdAt: 1700000000000,
      },
    ];
    const r = importAuto(snap);
    expect(r.format).toBe('artboard-snapshot');
    expect(r.result.success).toBe(true);
  });

  it('returns unknown format for unrecognized input', () => {
    const r = importAuto({ not: 'recognized' });
    expect(r.format).toBe('unknown');
    expect(r.result.success).toBe(false);
    if (!r.result.success) expect(r.result.error.code).toBe('unknown-format');
  });

  it('returns unknown for null', () => {
    const r = importAuto(null);
    expect(r.format).toBe('unknown');
    expect(r.result.success).toBe(false);
  });
});
