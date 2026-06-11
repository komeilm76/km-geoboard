/**
 * km-exports — Serialization functions for SVG, GeoJSON, OpenLayers,
 * PDF metadata, and raster draw instructions.
 *
 * All functions are pure: they receive data and return strings or structured
 * objects. No file I/O, no HTTP requests, no canvas rendering, no DOM access.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { exportToSvg, exportToGeoJson, exportToOpenLayers } from 'km-exports';
 * import type { SvgExportOptions, GeoJsonExportOptions } from 'km-exports';
 *
 * const svgResult = exportToSvg({ artboard, elements, pretty: true });
 * if (svgResult.success) console.log(svgResult.data); // "<svg viewBox=..."
 * ```
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  // Shared
  Result,
  ResultError,
  // Artboard
  Point,
  Size,
  Artboard,
  // SVG
  SvgLengthUnit,
  SvgLength,
  SvgColor,
  SvgTransformOperation,
  SvgTransform,
  SvgPresentationAttributes,
  SvgCoreAttributes,
  SvgPathElement,
  SvgRectElement,
  SvgCircleElement,
  SvgEllipseElement,
  SvgLineElement,
  SvgPolylineElement,
  SvgPolygonElement,
  SvgTextElement,
  SvgGroupElement,
  SvgElement,
  SvgViewBox,
  SvgDocument,
  // GeoJSON
  GeoJsonPosition,
  GeoJsonBoundingBox,
  GeoJsonLinearRing,
  GeoJsonPoint,
  GeoJsonMultiPoint,
  GeoJsonLineString,
  GeoJsonMultiLineString,
  GeoJsonPolygon,
  GeoJsonMultiPolygon,
  GeoJsonGeometryCollection,
  GeoJsonGeometry,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  // Export pipeline
  ExportFilter,
  SvgExportOptions,
  GeoJsonExportOptions,
  OpenLayersExportOptions,
  PdfMeta,
  RasterDrawInstruction,
  RasterExportPlan,
} from './types';

// ── Functions ─────────────────────────────────────────────────────────────────
export { applyExportFilter } from './filter';
export { exportToSvg }         from './exportToSvg';
export { exportToGeoJson }     from './exportToGeoJson';
export { exportToOpenLayers }  from './exportToOpenLayers';
export { exportToPdfMeta }     from './exportToPdfMeta';
export { exportToRasterPlan }  from './exportToRasterPlan';
