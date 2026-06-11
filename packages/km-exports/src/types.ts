/**
 * @file types.ts
 * All export pipeline types for km-exports.
 *
 * ── Dependency types ─────────────────────────────────────────────────────────
 * In the full monorepo these types are imported from sibling packages:
 *   Artboard          → km-artboard
 *   SvgElement (et al)→ km-svg
 *   GeoJsonFeature,
 *   GeoJsonGeometry,
 *   GeoJsonFeatureCollection → km-geojson
 *   Result<T>         → km-shared
 *
 * They are redefined here so the package is self-contained until the monorepo
 * is fully assembled. When workspace packages are available, replace these
 * re-definitions with the proper imports.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Shared: Result<T> ───────────────────────────────────────────────────────

/** Machine-readable failure descriptor returned by all fallible functions. */
export type ResultError = {
  /** Machine-readable code, e.g. "empty-export", "invalid-input". */
  code: string;
  /** Human-readable description. */
  message: string;
  /** The input field that caused the failure, if known. */
  field?: string;
};

/**
 * Discriminated-union result type.  Functions never throw — they return this.
 *
 * @example
 * const r = exportToSvg(opts);
 * if (!r.success) { console.error(r.error.code); return; }
 * console.log(r.data); // SVG string
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ResultError };

// ─── Artboard types (from km-artboard) ──────────────────────────────

/** A 2-D point in canvas coordinate space. */
export type Point = {
  x: number;
  y: number;
};

/** Width and height dimensions in canvas units. */
export type Size = {
  width: number;
  height: number;
};

/**
 * A named rectangular region on a canvas.
 * Origin is always the top-left corner (normalised from start/end points).
 */
export type Artboard = {
  /** Unique identifier (UUID v4). */
  id: string;
  /** Human-readable label. */
  name: string;
  /** Top-left corner — always normalised. */
  origin: Point;
  /** Width and height in canvas units. */
  size: Size;
  /** The raw start point supplied by the caller. */
  startPoint: Point;
  /** The raw end point supplied by the caller. */
  endPoint: Point;
  /** Unix timestamp (ms) when the artboard was created. */
  createdAt: number;
};

// ─── SVG types (from km-svg) ────────────────────────────────────────

/** Unit for SVG length values. */
export type SvgLengthUnit =
  | 'px' | 'pt' | 'pc' | 'mm' | 'cm' | 'in'
  | 'em' | 'ex' | 'rem' | 'vw' | 'vh' | '%' | '';

/** A length value with an explicit unit. */
export type SvgLength = {
  value: number;
  unit: SvgLengthUnit;
};

/** A colour in one of the supported SVG representations. */
export type SvgColor =
  | { type: 'hex';   value: string }
  | { type: 'rgb';   r: number; g: number; b: number }
  | { type: 'rgba';  r: number; g: number; b: number; a: number }
  | { type: 'named'; value: string }
  | { type: 'none' };

/** A single SVG transform operation. */
export type SvgTransformOperation =
  | { type: 'translate'; tx: number; ty: number }
  | { type: 'scale';     sx: number; sy: number }
  | { type: 'rotate';    angle: number; cx?: number; cy?: number }
  | { type: 'skewX';     angle: number }
  | { type: 'skewY';     angle: number }
  | { type: 'matrix';    a: number; b: number; c: number; d: number; e: number; f: number };

/** Ordered list of transform operations (applied left-to-right). */
export type SvgTransform = SvgTransformOperation[];

/** Presentation attributes shared by all visible SVG elements. */
export type SvgPresentationAttributes = {
  fill?: SvgColor;
  fillOpacity?: number;
  fillRule?: 'nonzero' | 'evenodd';
  stroke?: SvgColor;
  strokeWidth?: SvgLength;
  strokeOpacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'arcs' | 'miter-clip';
  strokeDasharray?: number[];
  strokeDashoffset?: number;
  strokeMiterlimit?: number;
  opacity?: number;
  display?: string;
  visibility?: 'visible' | 'hidden' | 'collapse';
  clipPath?: string;
  clipRule?: 'nonzero' | 'evenodd';
  mask?: string;
  filter?: string;
  pointerEvents?: string;
};

/** Core non-presentation attributes present on every SVG element. */
export type SvgCoreAttributes = {
  id?: string;
  className?: string;
  style?: string;
  transform?: SvgTransform;
  layer?: string;
  'data-attrs'?: Record<string, string>;
};

export type SvgPathElement     = SvgCoreAttributes & SvgPresentationAttributes & { type: 'path';     d: string };
export type SvgRectElement     = SvgCoreAttributes & SvgPresentationAttributes & { type: 'rect';     x: number; y: number; width: number; height: number; rx?: number; ry?: number };
export type SvgCircleElement   = SvgCoreAttributes & SvgPresentationAttributes & { type: 'circle';   cx: number; cy: number; r: number };
export type SvgEllipseElement  = SvgCoreAttributes & SvgPresentationAttributes & { type: 'ellipse';  cx: number; cy: number; rx: number; ry: number };
export type SvgLineElement     = SvgCoreAttributes & SvgPresentationAttributes & { type: 'line';     x1: number; y1: number; x2: number; y2: number };
export type SvgPolylineElement = SvgCoreAttributes & SvgPresentationAttributes & { type: 'polyline'; points: [number, number][] };
export type SvgPolygonElement  = SvgCoreAttributes & SvgPresentationAttributes & { type: 'polygon';  points: [number, number][] };
export type SvgTextElement     = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize?: SvgLength;
  fontFamily?: string;
  fontWeight?: string;
  textAnchor?: 'start' | 'middle' | 'end';
};
export type SvgGroupElement    = SvgCoreAttributes & SvgPresentationAttributes & { type: 'g'; children: SvgElement[] };

/** Union of all SVG element types. */
export type SvgElement =
  | SvgPathElement
  | SvgRectElement
  | SvgCircleElement
  | SvgEllipseElement
  | SvgLineElement
  | SvgPolylineElement
  | SvgPolygonElement
  | SvgTextElement
  | SvgGroupElement;

/** A viewBox descriptor extracted from an `<svg>` element. */
export type SvgViewBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

/** Top-level SVG document structure. */
export type SvgDocument = {
  viewBox?: SvgViewBox;
  width?: SvgLength;
  height?: SvgLength;
  elements: SvgElement[];
};

// ─── GeoJSON types (from km-geojson) ────────────────────────────────

/** [longitude, latitude] or [longitude, latitude, altitude]. */
export type GeoJsonPosition = [number, number] | [number, number, number];

/** [west, south, east, north] bounding box. */
export type GeoJsonBoundingBox =
  | [number, number, number, number]
  | [number, number, number, number, number, number];

/** A closed polygon ring (at least 4 positions, first === last). */
export type GeoJsonLinearRing = [GeoJsonPosition, GeoJsonPosition, GeoJsonPosition, GeoJsonPosition, ...GeoJsonPosition[]];

export type GeoJsonPoint              = { type: 'Point';              coordinates: GeoJsonPosition;           bbox?: GeoJsonBoundingBox };
export type GeoJsonMultiPoint         = { type: 'MultiPoint';         coordinates: GeoJsonPosition[];         bbox?: GeoJsonBoundingBox };
export type GeoJsonLineString         = { type: 'LineString';         coordinates: [GeoJsonPosition, GeoJsonPosition, ...GeoJsonPosition[]]; bbox?: GeoJsonBoundingBox };
export type GeoJsonMultiLineString    = { type: 'MultiLineString';    coordinates: [GeoJsonPosition, GeoJsonPosition, ...GeoJsonPosition[]][]; bbox?: GeoJsonBoundingBox };
export type GeoJsonPolygon            = { type: 'Polygon';            coordinates: GeoJsonLinearRing[];       bbox?: GeoJsonBoundingBox };
export type GeoJsonMultiPolygon       = { type: 'MultiPolygon';       coordinates: GeoJsonLinearRing[][];     bbox?: GeoJsonBoundingBox };
export type GeoJsonGeometryCollection = { type: 'GeometryCollection'; geometries: GeoJsonGeometry[];         bbox?: GeoJsonBoundingBox };

/** Union of all GeoJSON geometry types. */
export type GeoJsonGeometry =
  | GeoJsonPoint | GeoJsonMultiPoint
  | GeoJsonLineString | GeoJsonMultiLineString
  | GeoJsonPolygon | GeoJsonMultiPolygon
  | GeoJsonGeometryCollection;

/** A GeoJSON Feature. */
export type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry | null;
  properties: Record<string, unknown> | null;
  id?: string | number;
  bbox?: GeoJsonBoundingBox;
};

/** A GeoJSON FeatureCollection. */
export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
  bbox?: GeoJsonBoundingBox;
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
