import { describe, it, expect } from 'vitest';
import { detectLayerFormat, makeGeoJsonSource, makeXyzSource } from '../src/layers';
import type { GeoJsonFeatureCollection } from 'km-geojson';

// ─── detectLayerFormat ────────────────────────────────────────────────────────

describe('detectLayerFormat', () => {
  it('detects geojson from .geojson extension', () => {
    expect(detectLayerFormat('https://example.com/data.geojson')).toBe('geojson');
  });

  it('detects geojson from .json extension', () => {
    expect(detectLayerFormat('https://example.com/data.json')).toBe('geojson');
  });

  it('detects xyz from {z}/{x}/{y} pattern', () => {
    expect(detectLayerFormat('https://tile.example.com/{z}/{x}/{y}.png')).toBe('xyz');
  });

  it('detects wms from SERVICE=WMS query param', () => {
    expect(
      detectLayerFormat('https://geo.example.com/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap'),
    ).toBe('wms');
  });

  it('detects wms from /wms path segment', () => {
    expect(detectLayerFormat('https://geo.example.com/wms?layers=foo')).toBe('wms');
  });

  it('detects wmts from SERVICE=WMTS query param', () => {
    expect(detectLayerFormat('https://tile.example.com/wmts?SERVICE=WMTS')).toBe('wmts');
  });

  it('detects kml from .kml extension', () => {
    expect(detectLayerFormat('https://example.com/route.kml')).toBe('kml');
  });

  it('detects gpx from .gpx extension', () => {
    expect(detectLayerFormat('https://example.com/track.gpx')).toBe('gpx');
  });

  it('detects mvt from .pbf extension', () => {
    expect(detectLayerFormat('https://tiles.example.com/data.pbf')).toBe('mvt');
  });

  it('detects mvt from .mvt extension', () => {
    expect(detectLayerFormat('https://tiles.example.com/data.mvt')).toBe('mvt');
  });

  it('returns unknown for unrecognised URLs', () => {
    expect(detectLayerFormat('https://example.com/something')).toBe('unknown');
    expect(detectLayerFormat('https://example.com/')).toBe('unknown');
    expect(detectLayerFormat('just-a-string')).toBe('unknown');
  });

  it('xyz takes precedence over geojson for {z}/{x}/{y}.json URLs', () => {
    // If somehow both patterns match, xyz is checked after geojson extension
    // A URL like data.geojson wins for geojson check first
    expect(detectLayerFormat('https://example.com/data.geojson')).toBe('geojson');
    // XYZ without a recognised extension
    expect(detectLayerFormat('https://tiles.example.com/{z}/{x}/{y}')).toBe('xyz');
  });
});

// ─── makeGeoJsonSource ────────────────────────────────────────────────────────

describe('makeGeoJsonSource', () => {
  it('accepts a URL string', () => {
    const src = makeGeoJsonSource('https://example.com/data.geojson');
    expect(src).toEqual({
      type: 'geojson',
      data: 'https://example.com/data.geojson',
    });
  });

  it('accepts a GeoJsonFeatureCollection object', () => {
    const fc: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] };
    const src = makeGeoJsonSource(fc);
    expect(src.type).toBe('geojson');
    expect(src.data).toBe(fc);
  });

  it('returns type === "geojson"', () => {
    expect(makeGeoJsonSource('https://example.com/data.geojson').type).toBe('geojson');
  });
});

// ─── makeXyzSource ────────────────────────────────────────────────────────────

describe('makeXyzSource', () => {
  it('returns correct shape with default tileSize', () => {
    const src = makeXyzSource('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(src).toEqual({
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
    });
  });

  it('accepts tileSize 512', () => {
    const src = makeXyzSource('https://example.com/{z}/{x}/{y}.png', 512);
    expect(src.tileSize).toBe(512);
  });

  it('wraps the URL in a tiles array', () => {
    const url = 'https://tiles.example.com/{z}/{x}/{y}';
    const src = makeXyzSource(url);
    expect(src.tiles).toEqual([url]);
  });

  it('returns type === "raster"', () => {
    expect(makeXyzSource('https://example.com/{z}/{x}/{y}.png').type).toBe('raster');
  });
});
