/**
 * GeoJSON Feature builder utilities.
 * Construct Feature and FeatureCollection objects from geometry.
 */

import type {
  GeoJsonGeometry,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
} from './types';

/**
 * Wraps a geometry in a GeoJSON Feature object.
 *
 * @param geometry - The geometry to wrap.
 * @param properties - Optional key-value metadata. Defaults to `{}` (empty object, not null).
 * @param id - Optional feature identifier (string or number).
 * @returns A valid `GeoJsonFeature` object.
 *
 * @example
 * const point = { type: 'Point' as const, coordinates: [-0.1276, 51.5074] as [number, number] };
 * const feature = featureFromGeometry(point, { name: 'London' }, 'london-1');
 * // { type: 'Feature', geometry: point, properties: { name: 'London' }, id: 'london-1' }
 */
export function featureFromGeometry(
  geometry: GeoJsonGeometry,
  properties?: Record<string, unknown>,
  id?: string | number,
): GeoJsonFeature {
  const feature: GeoJsonFeature = {
    type: 'Feature',
    geometry,
    properties: properties ?? {},
  };
  if (id !== undefined) {
    feature.id = id;
  }
  return feature;
}

/**
 * Wraps an array of GeoJSON Features in a FeatureCollection.
 *
 * @param features - Array of Feature objects to collect.
 * @returns A valid `GeoJsonFeatureCollection` object.
 *
 * @example
 * const collection = collectionFromFeatures([feature1, feature2]);
 * // { type: 'FeatureCollection', features: [feature1, feature2] }
 */
export function collectionFromFeatures(features: GeoJsonFeature[]): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features,
  };
}
