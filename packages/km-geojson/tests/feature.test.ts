import { describe, it, expect } from 'vitest';
import { featureFromGeometry, collectionFromFeatures } from '../src/feature';
import type { GeoJsonPoint, GeoJsonFeature } from '../src/types';

const point: GeoJsonPoint = { type: 'Point', coordinates: [0, 0] };

// ─── featureFromGeometry ──────────────────────────────────────────────────────

describe('featureFromGeometry', () => {
  it('wraps geometry in a Feature with default empty properties', () => {
    const feature = featureFromGeometry(point);
    expect(feature.type).toBe('Feature');
    expect(feature.geometry).toBe(point);
    expect(feature.properties).toEqual({});
  });

  it('uses provided properties', () => {
    const feature = featureFromGeometry(point, { name: 'Origin' });
    expect(feature.properties).toEqual({ name: 'Origin' });
  });

  it('includes id when provided as string', () => {
    const feature = featureFromGeometry(point, {}, 'feature-1');
    expect(feature.id).toBe('feature-1');
  });

  it('includes id when provided as number', () => {
    const feature = featureFromGeometry(point, {}, 42);
    expect(feature.id).toBe(42);
  });

  it('omits id when not provided', () => {
    const feature = featureFromGeometry(point);
    expect('id' in feature).toBe(false);
  });

  it('omits id when only properties are provided', () => {
    const feature = featureFromGeometry(point, { name: 'test' });
    expect('id' in feature).toBe(false);
  });
});

// ─── collectionFromFeatures ───────────────────────────────────────────────────

describe('collectionFromFeatures', () => {
  it('wraps array in a FeatureCollection', () => {
    const f1: GeoJsonFeature = { type: 'Feature', geometry: point, properties: {} };
    const f2: GeoJsonFeature = { type: 'Feature', geometry: point, properties: { x: 1 } };
    const collection = collectionFromFeatures([f1, f2]);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(2);
    expect(collection.features[0]).toBe(f1);
    expect(collection.features[1]).toBe(f2);
  });

  it('wraps an empty array', () => {
    const collection = collectionFromFeatures([]);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(0);
  });
});
