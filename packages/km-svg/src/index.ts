/**
 * km-svg — SVG content as structured data.
 *
 * Parse SVG XML into typed element trees, manipulate paths,
 * and convert SVG geometry to GeoJSON.
 *
 * @packageDocumentation
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  SvgViewBox,
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
  SvgPathCommand,
  SvgDocument,
  SvgGeoMeta,
} from './types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
export {
  SvgViewBoxSchema,
  SvgLengthUnitSchema,
  SvgLengthSchema,
  SvgColorSchema,
  SvgTransformOperationSchema,
  SvgTransformSchema,
  SvgPresentationAttributesSchema,
  SvgCoreAttributesSchema,
  SvgPathElementSchema,
  SvgRectElementSchema,
  SvgCircleElementSchema,
  SvgEllipseElementSchema,
  SvgLineElementSchema,
  SvgPolylineElementSchema,
  SvgPolygonElementSchema,
  SvgTextElementSchema,
  SvgGroupElementSchema,
  SvgElementSchema,
  SvgDocumentSchema,
  SvgGeoMetaSchema,
} from './schemas';

// ─── Parse Functions ──────────────────────────────────────────────────────────
export { parseSvgDocument, parseColor, parseLength, parseViewBox, parseTransform } from './parseSvgDocument';
export { parseSvgPath } from './parseSvgPath';
export { serializeSvgPath } from './serializeSvgPath';

// ─── GeoJSON Conversion ───────────────────────────────────────────────────────
export {
  svgPointToGeoPosition,
  svgElementToGeoJsonFeature,
  svgDocumentToFeatureCollection,
} from './svgToGeoJson';
