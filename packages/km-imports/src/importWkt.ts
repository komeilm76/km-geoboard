/**
 * importWkt — parse a Well-Known Text (WKT, ISO 19125 / OGC SFA) string into
 * a normalized GeoJsonFeatureCollection.
 *
 * Supported: POINT, LINESTRING, POLYGON, MULTIPOINT, MULTILINESTRING,
 * MULTIPOLYGON, GEOMETRYCOLLECTION — case-insensitive, with optional
 * Z / M / ZM dimension modifiers and both `(10 20)` and `((10 20))` nesting.
 *
 * Normalization / warnings:
 * - M ordinates are dropped (GeoJSON has no measure axis) — warning `m-dropped`.
 * - Z ordinates are kept as the third coordinate.
 * - `EMPTY` geometries cannot be represented losslessly in GeoJSON — they are
 *   skipped with warning `empty-geometry` (a top-level EMPTY yields an empty
 *   FeatureCollection).
 */

import { collectionFromFeatures, featureFromGeometry } from '@komeilm76/km-geojson';
import type {
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  LinearRing,
  Position,
} from '@komeilm76/km-geojson';
import type { ImportResult, ImportWarning } from './types';

// ─── Errors ───────────────────────────────────────────────────────────────────

function wktError(
  code: 'empty-input' | 'invalid-wkt',
  message: string,
  position?: number,
): ImportResult<GeoJsonFeatureCollection> {
  return { success: false, error: { code, message, ...(position !== undefined ? { position } : {}) }, warnings: [] };
}

// ─── Tokenizer-free recursive parser over a cursor ────────────────────────────

type Ctx = {
  s: string;       // uppercased input
  raw: string;     // original input (for error excerpts)
  i: number;       // cursor
  warnings: ImportWarning[];
  mDropped: boolean; // emit the m-dropped warning only once
};

class WktSyntaxError extends Error {
  constructor(message: string, public position: number) {
    super(message);
  }
}

const KEYWORDS = [
  'GEOMETRYCOLLECTION', 'MULTILINESTRING', 'MULTIPOLYGON', 'MULTIPOINT',
  'LINESTRING', 'POLYGON', 'POINT',
] as const;
type Keyword = (typeof KEYWORDS)[number];

function skipWs(c: Ctx): void {
  while (c.i < c.s.length && /\s/.test(c.s[c.i] as string)) c.i++;
}

function expect(c: Ctx, ch: string): void {
  skipWs(c);
  if (c.s[c.i] !== ch) throw new WktSyntaxError(`Expected "${ch}"`, c.i);
  c.i++;
}

function tryConsume(c: Ctx, word: string): boolean {
  skipWs(c);
  if (c.s.startsWith(word, c.i)) {
    const after = c.s[c.i + word.length];
    // keyword boundary: end, whitespace, or punctuation
    if (after === undefined || /[\s(),]/.test(after)) {
      c.i += word.length;
      return true;
    }
  }
  return false;
}

function readKeyword(c: Ctx): Keyword {
  skipWs(c);
  for (const k of KEYWORDS) {
    if (tryConsume(c, k)) return k;
  }
  throw new WktSyntaxError('Expected a WKT geometry keyword', c.i);
}

/** Reads the optional Z / M / ZM dimension modifier. */
function readDims(c: Ctx): { hasZ: boolean; hasM: boolean } {
  if (tryConsume(c, 'ZM')) return { hasZ: true, hasM: true };
  if (tryConsume(c, 'Z')) return { hasZ: true, hasM: false };
  if (tryConsume(c, 'M')) return { hasZ: false, hasM: true };
  return { hasZ: false, hasM: false };
}

function readNumber(c: Ctx): number {
  skipWs(c);
  const m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(c.s.slice(c.i));
  if (!m) throw new WktSyntaxError('Expected a number', c.i);
  c.i += m[0].length;
  return Number(m[0]);
}

/** Reads one coordinate tuple `x y [z [m]]` according to the declared dims. */
function readPosition(c: Ctx, dims: { hasZ: boolean; hasM: boolean }): Position {
  const x = readNumber(c);
  const y = readNumber(c);
  const extras: number[] = [];
  // Declared dims first; if none declared, accept up to 2 trailing numbers (inferred z [m])
  if (dims.hasZ || dims.hasM) {
    if (dims.hasZ) extras.push(readNumber(c));
    if (dims.hasM) extras.push(readNumber(c));
  } else {
    while (extras.length < 2) {
      skipWs(c);
      if (!/[+\-.\d]/.test(c.s[c.i] ?? '')) break;
      extras.push(readNumber(c));
    }
  }
  let z: number | undefined;
  if (dims.hasZ) z = extras[0];
  else if (dims.hasM) z = undefined; // M-only: the extra is a measure, dropped
  else if (extras.length >= 1) z = extras[0]; // inferred: 3rd number is z
  const measurePresent = dims.hasM || (!dims.hasZ && !dims.hasM && extras.length === 2);
  if (measurePresent && !c.mDropped) {
    c.mDropped = true;
    c.warnings.push({
      code: 'm-dropped',
      message: 'WKT M (measure) ordinates were dropped — GeoJSON has no measure axis',
    });
  }
  return z !== undefined ? [x, y, z] : [x, y];
}

function readPositionList(c: Ctx, dims: { hasZ: boolean; hasM: boolean }): Position[] {
  expect(c, '(');
  const out: Position[] = [];
  for (;;) {
    skipWs(c);
    // MULTIPOINT allows nested parens per position: (10 20), ((10 20))
    if (c.s[c.i] === '(') {
      expect(c, '(');
      out.push(readPosition(c, dims));
      expect(c, ')');
    } else {
      out.push(readPosition(c, dims));
    }
    skipWs(c);
    if (c.s[c.i] === ',') { c.i++; continue; }
    break;
  }
  expect(c, ')');
  return out;
}

function readRingList(c: Ctx, dims: { hasZ: boolean; hasM: boolean }): LinearRing[] {
  expect(c, '(');
  const rings: LinearRing[] = [];
  for (;;) {
    const posStart = c.i;
    const ring = readPositionList(c, dims);
    if (ring.length < 4) {
      throw new WktSyntaxError(`Polygon ring must have at least 4 positions, got ${ring.length}`, posStart);
    }
    rings.push(ring as LinearRing);
    skipWs(c);
    if (c.s[c.i] === ',') { c.i++; continue; }
    break;
  }
  expect(c, ')');
  return rings;
}

function readMultiLineList(c: Ctx, dims: { hasZ: boolean; hasM: boolean }): Position[][] {
  expect(c, '(');
  const lines: Position[][] = [];
  for (;;) {
    lines.push(readPositionList(c, dims));
    skipWs(c);
    if (c.s[c.i] === ',') { c.i++; continue; }
    break;
  }
  expect(c, ')');
  return lines;
}

function readPolygonList(c: Ctx, dims: { hasZ: boolean; hasM: boolean }): LinearRing[][] {
  expect(c, '(');
  const polys: LinearRing[][] = [];
  for (;;) {
    polys.push(readRingList(c, dims));
    skipWs(c);
    if (c.s[c.i] === ',') { c.i++; continue; }
    break;
  }
  expect(c, ')');
  return polys;
}

/** Parses one geometry (recursive for GEOMETRYCOLLECTION). Returns null for EMPTY. */
function readGeometry(c: Ctx): GeoJsonGeometry | null {
  const keyword = readKeyword(c);
  const dims = readDims(c);

  if (tryConsume(c, 'EMPTY')) {
    c.warnings.push({
      code: 'empty-geometry',
      message: `${keyword} EMPTY cannot be represented in GeoJSON — skipped`,
      context: keyword,
    });
    return null;
  }

  switch (keyword) {
    case 'POINT': {
      expect(c, '(');
      const p = readPosition(c, dims);
      expect(c, ')');
      return { type: 'Point', coordinates: p };
    }
    case 'LINESTRING':
      return { type: 'LineString', coordinates: readPositionList(c, dims) as [Position, Position, ...Position[]] };
    case 'POLYGON':
      return { type: 'Polygon', coordinates: readRingList(c, dims) };
    case 'MULTIPOINT':
      return { type: 'MultiPoint', coordinates: readPositionList(c, dims) };
    case 'MULTILINESTRING':
      return { type: 'MultiLineString', coordinates: readMultiLineList(c, dims) as [Position, Position, ...Position[]][] };
    case 'MULTIPOLYGON':
      return { type: 'MultiPolygon', coordinates: readPolygonList(c, dims) };
    case 'GEOMETRYCOLLECTION': {
      expect(c, '(');
      const members: GeoJsonGeometry[] = [];
      for (;;) {
        const g = readGeometry(c);
        if (g !== null) members.push(g);
        skipWs(c);
        if (c.s[c.i] === ',') { c.i++; continue; }
        break;
      }
      expect(c, ')');
      return { type: 'GeometryCollection', geometries: members };
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a WKT string into a normalized GeoJsonFeatureCollection.
 *
 * The geometry is wrapped in a single Feature (empty properties), matching
 * the normalization contract of the other importers. A top-level `EMPTY`
 * yields a successful, empty FeatureCollection with an `empty-geometry`
 * warning.
 *
 * @param raw - A WKT string (e.g. `"POINT (10 20)"`).
 * @returns ImportResult<GeoJsonFeatureCollection>
 */
export function importWkt(raw: string | unknown): ImportResult<GeoJsonFeatureCollection> {
  if (raw === null || raw === undefined) {
    return wktError('empty-input', 'Input is null or undefined');
  }
  if (typeof raw !== 'string') {
    return wktError('invalid-wkt', `WKT input must be a string, got ${typeof raw}`);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return wktError('empty-input', 'Input is an empty string');
  }

  const c: Ctx = { s: trimmed.toUpperCase(), raw: trimmed, i: 0, warnings: [], mDropped: false };

  try {
    const geometry = readGeometry(c);
    skipWs(c);
    if (c.i !== c.s.length) {
      throw new WktSyntaxError('Unexpected trailing characters after geometry', c.i);
    }
    const features = geometry === null ? [] : [featureFromGeometry(geometry, {})];
    return { success: true, data: collectionFromFeatures(features), warnings: c.warnings };
  } catch (err) {
    if (err instanceof WktSyntaxError) {
      const excerpt = c.raw.slice(Math.max(0, err.position - 10), err.position + 10);
      return wktError('invalid-wkt', `${err.message} at position ${err.position} (…"${excerpt}"…)`, err.position);
    }
    return wktError('invalid-wkt', err instanceof Error ? err.message : String(err));
  }
}
