/**
 * SVG TypeScript types — no Zod imports.
 *
 * This file contains ONLY type definitions. Zod schemas live in `schemas.ts`.
 * This separation ensures declaration files never carry a Zod import.
 */

// ─── Primitives ────────────────────────────────────────────────────────────────

export type SvgViewBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

export type SvgLengthUnit =
  | 'px' | 'pt' | 'pc' | 'mm' | 'cm' | 'in'
  | 'em' | 'ex' | 'rem' | 'vw' | 'vh' | '%' | '';

export type SvgLength = {
  value: number;
  unit: SvgLengthUnit;
};

// ─── Color ─────────────────────────────────────────────────────────────────────

export type SvgColor =
  | { type: 'hex';   value: string }
  | { type: 'rgb';   r: number; g: number; b: number }
  | { type: 'rgba';  r: number; g: number; b: number; a: number }
  | { type: 'named'; value: string }
  | { type: 'none' };

// ─── Transform ────────────────────────────────────────────────────────────────

export type SvgTransformOperation =
  | { type: 'translate'; tx: number; ty: number }
  | { type: 'scale';     sx: number; sy: number }
  | { type: 'rotate';    angle: number; cx?: number; cy?: number }
  | { type: 'skewX';     angle: number }
  | { type: 'skewY';     angle: number }
  | { type: 'matrix';    a: number; b: number; c: number; d: number; e: number; f: number };

export type SvgTransform = SvgTransformOperation[];

// ─── Presentation Attributes ──────────────────────────────────────────────────

export type SvgPresentationAttributes = {
  fill?:             SvgColor;
  fillOpacity?:      number;
  fillRule?:         'nonzero' | 'evenodd';
  stroke?:           SvgColor;
  strokeWidth?:      SvgLength;
  strokeOpacity?:    number;
  strokeLinecap?:    'butt' | 'round' | 'square';
  strokeLinejoin?:   'miter' | 'round' | 'bevel' | 'arcs' | 'miter-clip';
  strokeDasharray?:  number[];
  strokeDashoffset?: number;
  strokeMiterlimit?: number;
  opacity?:          number;
  display?:          string;
  visibility?:       'visible' | 'hidden' | 'collapse';
  clipPath?:         string;
  clipRule?:         'nonzero' | 'evenodd';
  mask?:             string;
  filter?:           string;
  pointerEvents?:    string;
};

// ─── Core Attributes ──────────────────────────────────────────────────────────

export type SvgCoreAttributes = {
  id?:         string;
  className?:  string;
  style?:      string;
  transform?:  SvgTransform;
  'data-*'?:   Record<string, string>;
};

// ─── Element Types ────────────────────────────────────────────────────────────

export type SvgPathElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'path';
  d: string;
};

export type SvgRectElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
};

export type SvgCircleElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
};

export type SvgEllipseElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type SvgLineElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type SvgPolylineElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'polyline';
  points: [number, number][];
};

export type SvgPolygonElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'polygon';
  points: [number, number][];
};

export type SvgTextElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize?:    SvgLength;
  fontFamily?:  string;
  fontWeight?:  string;
  textAnchor?:  'start' | 'middle' | 'end';
};

export type SvgGroupElement = SvgCoreAttributes & SvgPresentationAttributes & {
  type: 'g';
  children: SvgElement[];
};

/** Union of all supported SVG element types. */
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

// ─── Path Commands ────────────────────────────────────────────────────────────

export type SvgPathCommand =
  | { cmd: 'M' | 'm'; x: number; y: number }
  | { cmd: 'L' | 'l'; x: number; y: number }
  | { cmd: 'H' | 'h'; x: number }
  | { cmd: 'V' | 'v'; y: number }
  | { cmd: 'C' | 'c'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { cmd: 'S' | 's'; x2: number; y2: number; x: number; y: number }
  | { cmd: 'Q' | 'q'; x1: number; y1: number; x: number; y: number }
  | { cmd: 'T' | 't'; x: number; y: number }
  | { cmd: 'A' | 'a'; rx: number; ry: number; rotation: number; largeArc: 0 | 1; sweep: 0 | 1; x: number; y: number }
  | { cmd: 'Z' | 'z' };

// ─── Document ─────────────────────────────────────────────────────────────────

export type SvgDocument = {
  viewBox?: SvgViewBox;
  width?:   SvgLength;
  height?:  SvgLength;
  elements: SvgElement[];
};

// ─── Geo Metadata ─────────────────────────────────────────────────────────────

/**
 * Metadata that maps SVG canvas coordinates to geographic coordinates.
 * Used to convert SVG shapes into GeoJSON with real-world positions.
 */
export type SvgGeoMeta = {
  /** The SVG bounding box (canvas coordinate space). */
  svgBounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Geographic bounding box [west, south, east, north] in degrees. */
  geoBounds: [number, number, number, number];
  /** Coordinate reference system identifier. @default "EPSG:4326" */
  crs?: string;
};
