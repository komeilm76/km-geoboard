import { describe, it, expect } from 'vitest';
import {
  svgPointToGeoPosition,
  svgElementToGeoJsonFeature,
  svgDocumentToFeatureCollection,
} from '../src/svgToGeoJson';
import type { SvgGeoMeta, SvgElement, SvgDocument } from '../src/types';

// A standard meta: SVG 0→100 maps to lng -180→180, lat 90→-90
const META: SvgGeoMeta = {
  svgBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  geoBounds: [-180, -90, 180, 90],
};

describe('svgPointToGeoPosition', () => {
  it('maps SVG origin to [west, north]', () => {
    expect(svgPointToGeoPosition([0, 0], META)).toEqual([-180, 90]);
  });

  it('maps SVG max corner to [east, south]', () => {
    expect(svgPointToGeoPosition([100, 100], META)).toEqual([180, -90]);
  });

  it('maps SVG center to [0, 0]', () => {
    const [lng, lat] = svgPointToGeoPosition([50, 50], META);
    expect(lng).toBeCloseTo(0);
    expect(lat).toBeCloseTo(0);
  });

  it('maps [100, 0] to [east, north]', () => {
    expect(svgPointToGeoPosition([100, 0], META)).toEqual([180, 90]);
  });

  it('maps [0, 100] to [west, south]', () => {
    expect(svgPointToGeoPosition([0, 100], META)).toEqual([-180, -90]);
  });

  it('correctly inverts the Y axis', () => {
    // SVG y=25 is 25% down → lat should be 90 - 25%*(90-(-90)) = 90 - 45 = 45
    const [, lat] = svgPointToGeoPosition([50, 25], META);
    expect(lat).toBeCloseTo(45);
  });
});

describe('svgElementToGeoJsonFeature', () => {
  it('converts rect to 5-point closed Polygon ring', () => {
    const rect: SvgElement = { type: 'rect', x: 0, y: 0, width: 100, height: 100 };
    const result = svgElementToGeoJsonFeature(rect, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('Polygon');
    if (geom.type !== 'Polygon') return;
    expect(geom.coordinates[0]).toHaveLength(5);
    // First and last must be the same (closed)
    expect(geom.coordinates[0]![0]).toEqual(geom.coordinates[0]![4]);
  });

  it('converts line to 2-point LineString', () => {
    const line: SvgElement = { type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 };
    const result = svgElementToGeoJsonFeature(line, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('LineString');
    if (geom.type !== 'LineString') return;
    expect(geom.coordinates).toHaveLength(2);
  });

  it('converts circle to Polygon with 65 points (64 + close)', () => {
    const circle: SvgElement = { type: 'circle', cx: 50, cy: 50, r: 25 };
    const result = svgElementToGeoJsonFeature(circle, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('Polygon');
    if (geom.type !== 'Polygon') return;
    expect(geom.coordinates[0]).toHaveLength(65); // 64 points + closing point
  });

  it('converts ellipse to Polygon with 65 points', () => {
    const ellipse: SvgElement = { type: 'ellipse', cx: 50, cy: 50, rx: 30, ry: 20 };
    const result = svgElementToGeoJsonFeature(ellipse, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.geometry.type).toBe('Polygon');
  });

  it('converts text to Point at anchor position', () => {
    const text: SvgElement = { type: 'text', x: 50, y: 50, content: 'Hello' };
    const result = svgElementToGeoJsonFeature(text, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('Point');
    if (geom.type !== 'Point') return;
    expect(geom.coordinates[0]).toBeCloseTo(0);
    expect(geom.coordinates[1]).toBeCloseTo(0);
  });

  it('converts polyline to LineString', () => {
    const polyline: SvgElement = { type: 'polyline', points: [[0,0],[50,50],[100,0]] };
    const result = svgElementToGeoJsonFeature(polyline, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.geometry.type).toBe('LineString');
  });

  it('converts polygon to closed Polygon', () => {
    const polygon: SvgElement = { type: 'polygon', points: [[0,0],[100,0],[50,100]] };
    const result = svgElementToGeoJsonFeature(polygon, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('Polygon');
    if (geom.type !== 'Polygon') return;
    // 3 input points + 1 closing = 4
    expect(geom.coordinates[0]).toHaveLength(4);
    expect(geom.coordinates[0]![0]).toEqual(geom.coordinates[0]![3]);
  });

  it('converts g (group) to GeometryCollection', () => {
    const group: SvgElement = {
      type: 'g',
      children: [
        { type: 'rect', x: 0, y: 0, width: 10, height: 10 },
        { type: 'circle', cx: 50, cy: 50, r: 10 },
      ],
    };
    const result = svgElementToGeoJsonFeature(group, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const geom = result.data.geometry;
    expect(geom.type).toBe('GeometryCollection');
    if (geom.type !== 'GeometryCollection') return;
    expect(geom.geometries).toHaveLength(2);
  });

  it('converts closed path to Polygon', () => {
    const path: SvgElement = { type: 'path', d: 'M 0 0 L 100 0 L 50 100 Z' };
    const result = svgElementToGeoJsonFeature(path, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.geometry.type).toBe('Polygon');
  });

  it('converts open path to LineString', () => {
    const path: SvgElement = { type: 'path', d: 'M 0 0 L 50 50 L 100 0' };
    const result = svgElementToGeoJsonFeature(path, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.geometry.type).toBe('LineString');
  });

  it('stores fill attribute in Feature.properties', () => {
    const rect: SvgElement = {
      type: 'rect', x: 0, y: 0, width: 50, height: 50,
      fill: { type: 'hex', value: '#ff0000' },
    };
    const result = svgElementToGeoJsonFeature(rect, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.properties).toBeDefined();
    expect(result.data.properties!['fill']).toBeDefined();
  });
});

describe('svgDocumentToFeatureCollection', () => {
  it('converts a single-element document', () => {
    const doc: SvgDocument = {
      elements: [{ type: 'rect', x: 0, y: 0, width: 100, height: 100 }],
    };
    const result = svgDocumentToFeatureCollection(doc, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.type).toBe('FeatureCollection');
    expect(result.data.features).toHaveLength(1);
  });

  it('converts a multi-element document', () => {
    const doc: SvgDocument = {
      elements: [
        { type: 'rect',   x: 0, y: 0, width: 50, height: 50 },
        { type: 'circle', cx: 75, cy: 75, r: 10 },
        { type: 'text',   x: 50, y: 50, content: 'Hello' },
      ],
    };
    const result = svgDocumentToFeatureCollection(doc, META);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.features).toHaveLength(3);
  });

  it('succeeds even if an element conversion would normally fail (path with empty d)', () => {
    const doc: SvgDocument = {
      elements: [
        { type: 'rect',   x: 0, y: 0, width: 50, height: 50 },
        { type: 'path',   d: '' },
      ],
    };
    // Should not throw
    const result = svgDocumentToFeatureCollection(doc, META);
    expect(result.success).toBe(true);
    // rect should succeed
    if (!result.success) return;
    expect(result.data.features.length).toBeGreaterThanOrEqual(1);
  });
});
