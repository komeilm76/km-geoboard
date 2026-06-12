/**
 * Coverage completion for T-013: barrel import, every SVG element serializer,
 * every filter step, every raster instruction branch, empty-export branches.
 */
import { describe, expect, it } from 'vitest';
import {
  applyExportFilter,
  exportToRasterPlan,
  exportToSvg,
} from '../src/index';
import { getGeometryBoundingBox } from '../src/filter';
import type { Artboard, ExportFilter, GeoJsonGeometry, SvgElement } from '../src/types';

const AB: Artboard = {
  id: 'ab1', name: 'T', origin: { x: 0, y: 0 }, size: { width: 100, height: 100 },
  startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 100 }, createdAt: 0,
};

const ALL: SvgElement[] = [
  {
    type: 'rect', id: 'r1', x: 0, y: 0, width: 10, height: 10, rx: 1, ry: 1,
    fill: { type: 'hex', value: '#ff0000' }, fillOpacity: 0.9, fillRule: 'evenodd',
    stroke: { type: 'rgb', r: 1, g: 2, b: 3 }, strokeWidth: { value: 2, unit: 'px' },
    strokeOpacity: 0.8, strokeLinecap: 'round', strokeLinejoin: 'bevel',
    strokeDasharray: [1, 2], strokeDashoffset: 1, strokeMiterlimit: 4, opacity: 0.7,
    className: 'k', style: 'a:b',
    transform: [
      { type: 'translate', tx: 1, ty: 2 }, { type: 'scale', sx: 2, sy: 2 },
      { type: 'rotate', angle: 45, cx: 5, cy: 5 }, { type: 'rotate', angle: 10 },
      { type: 'skewX', angle: 1 }, { type: 'skewY', angle: 2 },
      { type: 'matrix', a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    ],
  },
  { type: 'circle', id: 'c1', cx: 5, cy: 5, r: 2, fill: { type: 'rgba', r: 1, g: 2, b: 3, a: 0.5 } },
  { type: 'ellipse', id: 'e1', cx: 5, cy: 5, rx: 3, ry: 2, fill: { type: 'named', value: 'red' }, strokeWidth: { value: 1, unit: '' } },
  { type: 'line', id: 'l1', x1: 0, y1: 0, x2: 9, y2: 9, stroke: { type: 'none' }, strokeWidth: { value: 1, unit: '' } },
  { type: 'polyline', id: 'pl1', points: [[0, 0], [5, 5], [9, 0]], fill: { type: 'none' } },
  { type: 'polygon', id: 'pg1', points: [[0, 0], [9, 0], [9, 9]], fill: { type: 'hex', value: '#00ff00' } },
  { type: 'path', id: 'p1', d: 'M 0 0 L 9 9 Z', fill: { type: 'none' }, stroke: { type: 'hex', value: '#000' }, strokeWidth: { value: 1, unit: '' } },
  { type: 'text', id: 't1', x: 1, y: 2, content: 'hi', fontSize: { value: 10, unit: 'px' }, fontFamily: 'serif', fontWeight: 'bold', textAnchor: 'middle' },
  {
    type: 'g', id: 'g1',
    transform: [{ type: 'translate', tx: 1, ty: 1 }],
    children: [{ type: 'rect', x: 1, y: 1, width: 2, height: 2 }],
  },
];

describe('exportToSvg serializes every element kind', () => {
  it('pretty with xml declaration', () => {
    const r = exportToSvg({ artboard: AB, elements: ALL, pretty: true, xmlDeclaration: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    for (const frag of ['<rect', '<circle', '<ellipse', '<line', '<polyline', '<polygon', '<path', '<text', '<g', 'rgba(1, 2, 3, 0.5)', 'rotate(45, 5, 5)', 'rotate(10)', 'matrix(', 'stroke-dasharray="1 2"'])
      expect(r.data).toContain(frag);
  });
  it('compact without xml declaration', () => {
    const r = exportToSvg({ artboard: AB, elements: ALL, pretty: false, xmlDeclaration: false });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.startsWith('<svg')).toBe(true);
  });
  it('returns empty-export when the filter removes everything', () => {
    const r = exportToSvg({ artboard: AB, elements: ALL, filter: { includeIds: ['nope'] } });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-export');
  });
});

describe('exportToRasterPlan covers every instruction branch', () => {
  it('png at scale 2', () => {
    const r = exportToRasterPlan(AB, ALL, 'png', 2);
    expect(r.success).toBe(true);
  });
  it('jpeg at default scale', () => {
    const r = exportToRasterPlan(AB, ALL, 'jpeg');
    expect(r.success).toBe(true);
  });
  it('empty-export branch', () => {
    const r = exportToRasterPlan(AB, ALL, 'png', 1, { includeIds: ['nope'] });
    expect(r.success).toBe(false);
  });
});

describe('applyExportFilter steps', () => {
  type Item = { id?: string; layer?: string; type?: string; [k: string]: unknown };
  const items: Item[] = [
    { id: 'a', layer: 'L1', type: 'rect', x: 0, y: 0, width: 5, height: 5 },
    { id: 'b', layer: 'L2', type: 'circle', cx: 50, cy: 50, r: 1 },
    { id: 'c', type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 },
    { id: 'd', type: 'polyline', points: [[90, 90], [95, 95]] },
    { id: 'e', type: 'text', x: 99, y: 99 },
    { layer: 'L1', type: 'mystery' },
  ];
  it('no filter returns all', () => {
    expect(applyExportFilter(items)).toHaveLength(6);
  });
  it('includeIds / excludeIds', () => {
    expect(applyExportFilter(items, { includeIds: ['a', 'b'] })).toHaveLength(2);
    expect(applyExportFilter(items, { excludeIds: ['a'] }).find((i) => i.id === 'a')).toBeUndefined();
  });
  it('includeLayers / excludeLayers keep unlayered items conservatively', () => {
    const inc = applyExportFilter(items, { includeLayers: ['L1'] });
    expect(inc.map((i) => i.id)).toEqual(['a', 'c', 'd', 'e', undefined]);
    const exc = applyExportFilter(items, { excludeLayers: ['L1'] });
    expect(exc.find((i) => i.id === 'a')).toBeUndefined();
  });
  it('boundingBox keeps intersecting + undetectable geometry', () => {
    const f: ExportFilter = { boundingBox: [0, 0, 10, 10] };
    const kept = applyExportFilter(items, f).map((i) => i.id);
    expect(kept).toContain('a');     // rect intersects
    expect(kept).toContain('c');     // line intersects
    expect(kept).toContain(undefined); // mystery kept conservatively
    expect(kept).not.toContain('b'); // circle at 50,50 r1
    expect(kept).not.toContain('d'); // polyline far away
    expect(kept).not.toContain('e'); // text at 99,99
  });
});

describe('getGeometryBoundingBox over every geometry kind', () => {
  const geoms: GeoJsonGeometry[] = [
    { type: 'Point', coordinates: [1, 2] },
    { type: 'MultiPoint', coordinates: [[0, 0], [2, 2]] },
    { type: 'LineString', coordinates: [[0, 0], [3, 3]] },
    { type: 'MultiLineString', coordinates: [[[0, 0], [1, 1]], [[2, 2], [4, 4]]] },
    { type: 'Polygon', coordinates: [[[0, 0], [5, 0], [5, 5], [0, 0]]] },
    { type: 'MultiPolygon', coordinates: [[[[0, 0], [6, 0], [6, 6], [0, 0]]]] },
    { type: 'GeometryCollection', geometries: [{ type: 'Point', coordinates: [7, 8] }] },
  ];
  it('computes a bbox for each', () => {
    for (const g of geoms) expect(getGeometryBoundingBox(g)).not.toBeNull();
  });
  it('returns null for an empty GeometryCollection', () => {
    expect(getGeometryBoundingBox({ type: 'GeometryCollection', geometries: [] })).toBeNull();
  });
});
