/**
 * km-map — Pure coordinate math and geographic utilities.
 *
 * No map renderer required. Works in Node.js, browser, and edge runtimes.
 *
 * @packageDocumentation
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type { LatLng, MercatorPoint, TileCoord, PixelPoint, BoundingBox, SupportedLayerFormat } from './types';

// ─── Projections ──────────────────────────────────────────────────────────────
export { latLngToMercator, mercatorToLatLng, latLngToPixel, pixelToLatLng } from './projection';

// ─── Tiles ────────────────────────────────────────────────────────────────────
export { latLngToTile, tileToBounds, tilesForBounds, tileToQuadKey, quadKeyToTile } from './tiles';

// ─── Distance & Area ──────────────────────────────────────────────────────────
export { haversineDistance, rhumbDistance, bearing, destinationPoint, polygonArea } from './distance';

// ─── Bounds ───────────────────────────────────────────────────────────────────
export { boundsFromLatLngs, boundsCenter, boundsContains, boundsIntersect, boundsExpand, boundsUnion } from './bounds';

// ─── Scale ────────────────────────────────────────────────────────────────────
export { zoomToScale, scaleToZoom, metersPerPixel } from './scale';

// ─── Layers ───────────────────────────────────────────────────────────────────
export { detectLayerFormat, makeGeoJsonSource, makeXyzSource } from './layers';
