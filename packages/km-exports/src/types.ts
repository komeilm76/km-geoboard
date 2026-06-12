/**
 * @file types.ts
 * Export pipeline types for @komeilm76/km-exports.
 *
 * Cross-package types (Result, Artboard, SVG, GeoJSON) are imported from
 * their canonical sibling packages and re-exported for convenience — they
 * are no longer redefined here (see .planning/archives/sprint-1/project-evaluation P1: a type lives in
 * exactly one package).
 *
 * Only export-specific types live in this file: ExportFilter, the option
 * types, PdfMeta, RasterDrawInstruction, RasterExportPlan.
 */

// ─── Shared (from @komeilm76/km-shared) ──────────────────────────────────────

export type { Result, ResultError } from '@komeilm76/km-shared';

// ─── Artboard (from @komeilm76/km-artboard) ──────────────────────────────────

export type { Point, Size, Artboard } from '@komeilm76/km-artboard';

// ─── SVG (from @komeilm76/km-svg) ────────────────────────────────────────────

export type {
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
} from '@komeilm76/km-svg';

// ─── GeoJSON (from @komeilm76/km-geojson) ────────────────────────────────────
// km-geojson uses the unprefixed names Position / BoundingBox / LinearRing;
// they are re-exported here under the GeoJson-prefixed names this package's
// public API has always used.

export type {
  Position as GeoJsonPosition,
  BoundingBox as GeoJsonBoundingBox,
  LinearRing as GeoJsonLinearRing,
  GeoJsonPoint,
  GeoJsonMultiPoint,
  GeoJsonLineString,
  GeoJsonMultiLineString,
  GeoJsonPolygon,
  GeoJsonMultiPolygon,
  GeoJsonGeometryCollection,
  GeoJsonGeometry,
} from '@komeilm76/km-geojson';

import type {
  GeoJsonFeature as CanonicalGeoJsonFeature,
  GeoJsonFeatureCollection as CanonicalGeoJsonFeatureCollection,
  GeoJsonGeometry as CanonicalGeoJsonGeometry,
} from '@komeilm76/km-geojson';

// Re-exports above do not bring names into local scope — import the ones the
// option types below reference directly.
import type { Artboard } from '@komeilm76/km-artboard';
import type { SvgElement } from '@komeilm76/km-svg';

/**
 * A GeoJSON Feature as handled by the export pipeline.
 *
 * This is the canonical `GeoJsonFeature` from `@komeilm76/km-geojson`
 * instantiated with nullable geometry and properties — RFC 7946 allows both
 * to be `null`, and the exporters handle that case explicitly.
 */
export type GeoJsonFeature = CanonicalGeoJsonFeature<
  CanonicalGeoJsonGeometry | null,
  Record<string, unknown> | null
>;

/**
 * A GeoJSON FeatureCollection as produced by the export pipeline.
 *
 * Extends the canonical `GeoJsonFeatureCollection` from
 * `@komeilm76/km-geojson` with the optional OpenLayers `crs` annotation —
 * added by {@link exportToOpenLayers} when projection ≠ EPSG:4326. The `crs`
 * field is export-specific (legacy GeoJSON / OpenLayers convention), which is
 * why it lives here rather than in km-geojson.
 */
export type GeoJsonFeatureCollection = CanonicalGeoJsonFeatureCollection<
  CanonicalGeoJsonGeometry | null,
  Record<string, unknown> | null
> & {
  /** OpenLayers CRS annotation — added by exportToOpenLayers when projection ≠ EPSG:4326. */
  crs?: { type: 'name'; properties: { name: string } };
};

// ─── Export pipeline types ───────────────────────────────────────────────────

/**
 * Controls which elements or features are included in an export.
 * All fields are optional; omitting them passes everything through.
 */
export type ExportFilter = {
  /**
   * Only include items whose `id` is in this list.
   * If empty or undefined, the includeIds step is skipped and all items pass.
   */
  includeIds?: string[];

  /**
   * Exclude items whose `id` is in this list.
   */
  excludeIds?: string[];

  /**
   * Only include items whose `layer` property matches one of these values.
   * If empty or undefined, the includeLayers step is skipped.
   */
  includeLayers?: string[];

  /**
   * Exclude items whose `layer` property matches one of these values.
   */
  excludeLayers?: string[];

  /**
   * Bounding box [minX, minY, maxX, maxY] in canvas/artboard coordinate space
   * (not geographic coordinates).
   * Only items that intersect this box are included.
   * Items with no detectable geometry are kept conservatively.
   */
  boundingBox?: [number, number, number, number];
};

/**
 * Options for {@link exportToSvg}.
 */
export type SvgExportOptions = {
  /**
   * The artboard that defines the SVG `viewBox` and optional `width`/`height`.
   */
  artboard: Artboard;

  /**
   * SVG elements to serialize.
   */
  elements: SvgElement[];

  /**
   * Optional element filter applied before serialization.
   */
  filter?: ExportFilter;

  /**
   * Whether to inline all referenced assets (fonts, linked images) as base64.
   * @default false
   */
  inlineAssets?: boolean;

  /**
   * Whether to prepend the XML declaration `<?xml version="1.0" encoding="UTF-8"?>`.
   * @default true
   */
  xmlDeclaration?: boolean;

  /**
   * Pretty-print the SVG output with 2-space indentation.
   * @default false
   */
  pretty?: boolean;
};

/**
 * Options for {@link exportToGeoJson}.
 */
export type GeoJsonExportOptions = {
  /**
   * GeoJSON features to serialize into a FeatureCollection.
   */
  features: GeoJsonFeature[];

  /**
   * Optional feature filter applied before serialization.
   */
  filter?: ExportFilter;

  /**
   * Whether to compute and attach a `bbox` at the FeatureCollection level.
   * Computed as the union of all feature geometry bounding boxes.
   * If all features have null geometry, `bbox` is omitted even when true.
   * @default true
   */
  includeBbox?: boolean;

  /**
   * Pretty-print the JSON output with 2-space indentation.
   * @default false
   */
  pretty?: boolean;
};

/**
 * Options for {@link exportToOpenLayers}.
 */
export type OpenLayersExportOptions = {
  /**
   * GeoJSON features to export as an OpenLayers vector source payload.
   */
  features: GeoJsonFeature[];

  /**
   * Coordinate reference system for the output.
   * When this differs from the default, a `crs` field is added to the JSON.
   * @default "EPSG:4326"
   */
  projection?: string;

  /**
   * Optional feature filter applied before serialization.
   */
  filter?: ExportFilter;

  /**
   * Pretty-print the JSON output with 2-space indentation.
   * @default false
   */
  pretty?: boolean;
};

/**
 * A plain data object that a consumer passes to a PDF library (jsPDF, PDFKit,
 * pdfmake) to produce an actual PDF document.
 *
 * **This library does NOT generate a PDF.** It produces the `PdfMeta` descriptor
 * only. The consumer is responsible for rendering the SVG string onto the page
 * using their chosen PDF library.
 */
export type PdfMeta = {
  /**
   * Page size in points (1 pt = 1/72 inch).
   * Orientation swap has already been applied — `width` and `height` are final.
   */
  pageSize: { width: number; height: number };

  /**
   * Page orientation used to derive the final `pageSize`.
   */
  orientation: 'portrait' | 'landscape';

  /**
   * Self-contained SVG string for the page content.
   * The SVG `viewBox` uses artboard canvas units.
   * The PDF library is responsible for scaling it to fit `pageSize`.
   */
  svgContent: string;

  /**
   * Original artboard dimensions for reference — useful for computing scale ratios.
   */
  artboard: Artboard;

  /**
   * Optional document title metadata.
   */
  title?: string;

  /**
   * Optional document author metadata.
   */
  author?: string;
};

/**
 * A single draw instruction produced by {@link exportToRasterPlan}.
 * The consumer executes these with a canvas API (e.g. `CanvasRenderingContext2D`).
 *
 * Discriminated on `type`:
 * - `"rect"`   — filled/stroked rectangle
 * - `"path"`   — SVG path data string
 * - `"circle"` — filled/stroked circle
 * - `"text"`   — text drawn at a point
 */
export type RasterDrawInstruction =
  | {
      type: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: 'path';
      /** SVG path `d` string. A leading `scale(N)` transform may be prepended for scaled exports. */
      d: string;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke?: string;
    }
  | {
      type: 'text';
      x: number;
      y: number;
      content: string;
      /** CSS font string, e.g. `"14px sans-serif"`. */
      font: string;
      fill: string;
    };

/**
 * A complete set of canvas draw instructions for rendering to PNG or JPEG.
 * The consumer executes {@link RasterDrawInstruction}s using a canvas API.
 *
 * Instructions follow the painter's algorithm — later items draw on top of earlier ones.
 *
 * **This library does NOT touch any canvas API.** It only produces this plan.
 */
export type RasterExportPlan = {
  /**
   * Canvas width in pixels (artboard width × scale, rounded to integer).
   */
  canvasWidth: number;

  /**
   * Canvas height in pixels (artboard height × scale, rounded to integer).
   */
  canvasHeight: number;

  /**
   * Background fill colour applied before drawing any instructions.
   * @default "#ffffff"
   */
  background: string;

  /**
   * Ordered draw instructions (painter's algorithm — later = on top).
   */
  instructions: RasterDrawInstruction[];

  /**
   * Target raster format.
   */
  format: 'png' | 'jpeg';

  /**
   * JPEG quality, range 0–1.
   * Only relevant when `format` is `"jpeg"`.
   * Ignored for PNG (lossless).
   * @default 0.92
   */
  quality?: number;
};
