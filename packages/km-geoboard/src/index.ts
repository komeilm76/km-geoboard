/**
 * @komeilm76/km-geoboard — umbrella package for the km-geoboard suite.
 *
 * Re-exports the public surface of all eight packages under namespaces,
 * so app consumers need a single install and a single import:
 *
 * @example
 * ```typescript
 * import { artboard, svg, geojson, map, imports, exports, plugins } from '@komeilm76/km-geoboard';
 *
 * const board = artboard.createArtboard({
 *   startPoint: { x: 0, y: 0 },
 *   endPoint: { x: 800, y: 600 },
 *   name: 'Main',
 * });
 *
 * const doc = svg.parseSvgDocument('<svg viewBox="0 0 100 100">…</svg>');
 * ```
 *
 * Individual packages (`@komeilm76/km-artboard`, …) remain installable on
 * their own for tree-shaking-conscious consumers.
 *
 * @packageDocumentation
 */

export * as shared from '@komeilm76/km-shared';
export * as artboard from '@komeilm76/km-artboard';
export * as geojson from '@komeilm76/km-geojson';
export * as svg from '@komeilm76/km-svg';
export * as map from '@komeilm76/km-map';
export * as imports from '@komeilm76/km-imports';
export * as exports from '@komeilm76/km-exports';
export * as plugins from '@komeilm76/km-plugins';
