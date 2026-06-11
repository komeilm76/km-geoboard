/**
 * Integration: SVG string → parseSvgDocument → svgDocumentToFeatureCollection
 * → exportToSvg → reparse. Geometry must be preserved end-to-end.
 *
 * Packages exercised: km-svg, km-geojson, km-exports, km-artboard.
 */
import { describe, it, expect } from 'vitest';
import { artboard, svg, exports as exporters } from '../../src/index';
import type { SvgGeoMeta, SvgRectElement, SvgCircleElement, SvgLineElement } from '@komeilm76/km-svg';

const SVG_STRING = [
  '<svg viewBox="0 0 100 100" width="100px" height="100px">',
  '  <rect x="10" y="10" width="30" height="20" fill="#ff0000" />',
  '  <circle cx="60" cy="60" r="15" fill="#00ff00" />',
  '  <line x1="0" y1="0" x2="100" y2="100" stroke="#0000ff" />',
  '</svg>',
].join('\n');

/** Canvas 0..100 maps onto geo lng −10..10, lat −10..10. */
const GEO_META: SvgGeoMeta = {
  svgBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  geoBounds: [-10, -10, 10, 10],
};

function makeBoard() {
  const r = artboard.createArtboard({
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 100 },
    name: 'integration',
  });
  if (!r.success) throw new Error('artboard creation failed');
  return r.artboard;
}

describe('SVG → GeoJSON → SVG round-trip', () => {
  it('parses the SVG document', () => {
    const parsed = svg.parseSvgDocument(SVG_STRING);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.elements).toHaveLength(3);
    expect(parsed.data.viewBox).toEqual({ minX: 0, minY: 0, width: 100, height: 100 });
  });

  it('converts the parsed document to a FeatureCollection with geo coordinates', () => {
    const parsed = svg.parseSvgDocument(SVG_STRING);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const fc = svg.svgDocumentToFeatureCollection(parsed.data, GEO_META);
    expect(fc.success).toBe(true);
    if (!fc.success) return;

    expect(fc.data.type).toBe('FeatureCollection');
    expect(fc.data.features).toHaveLength(3);

    // rect(10,10,30x20) → Polygon; first ring position maps to lng −8, lat 8.
    const polygonGeom = fc.data.features
      .map((f) => f.geometry)
      .find((g) => g.type === 'Polygon');
    expect(polygonGeom).toBeDefined();
    if (polygonGeom?.type === 'Polygon') {
      const ring = polygonGeom.coordinates[0]!;
      expect(ring[0]![0]).toBeCloseTo(-8, 10); // west + 10/100 * 20
      expect(ring[0]![1]).toBeCloseTo(8, 10); // north − 10/100 * 20
      // Ring is closed
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    }

    // line → LineString from (−10,10) to (10,−10)
    const lineGeom = fc.data.features
      .map((f) => f.geometry)
      .find((g) => g.type === 'LineString');
    expect(lineGeom).toBeDefined();
    if (lineGeom?.type === 'LineString') {
      expect(lineGeom.coordinates[0]).toEqual([-10, 10]);
      expect(lineGeom.coordinates[1]).toEqual([10, -10]);
    }
  });

  it('exports the parsed elements back to SVG and reparses with geometry preserved', () => {
    const parsed = svg.parseSvgDocument(SVG_STRING);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const out = exporters.exportToSvg({
      artboard: makeBoard(),
      elements: parsed.data.elements,
    });
    expect(out.success).toBe(true);
    if (!out.success) return;

    const reparsed = svg.parseSvgDocument(out.data);
    expect(reparsed.success).toBe(true);
    if (!reparsed.success) return;

    expect(reparsed.data.elements).toHaveLength(3);

    const rect = reparsed.data.elements.find((e) => e.type === 'rect') as SvgRectElement;
    expect(rect).toMatchObject({ x: 10, y: 10, width: 30, height: 20 });

    const circle = reparsed.data.elements.find((e) => e.type === 'circle') as SvgCircleElement;
    expect(circle).toMatchObject({ cx: 60, cy: 60, r: 15 });

    const line = reparsed.data.elements.find((e) => e.type === 'line') as SvgLineElement;
    expect(line).toMatchObject({ x1: 0, y1: 0, x2: 100, y2: 100 });
  });

  it('round-trips the GeoJSON produced from SVG through exportToGeoJson', () => {
    const parsed = svg.parseSvgDocument(SVG_STRING);
    if (!parsed.success) throw new Error('parse failed');
    const fc = svg.svgDocumentToFeatureCollection(parsed.data, GEO_META);
    if (!fc.success) throw new Error('conversion failed');

    const exported = exporters.exportToGeoJson({ features: fc.data.features });
    expect(exported.success).toBe(true);
    if (!exported.success) return;

    const roundTripped = JSON.parse(exported.data) as { type: string; features: unknown[] };
    expect(roundTripped.type).toBe('FeatureCollection');
    expect(roundTripped.features).toEqual(fc.data.features);
  });
});
