/**
 * Zod v4 schemas for all SVG types.
 *
 * Exported constants use SchemaOf<T> (a local structural type) so generated
 * .d.ts files never carry `import { z } from 'zod'`. See zod_hang.md Rules 1,3,6.
 */

import { z } from 'zod';
import { finiteNumber as _finiteNumber, opacitySchema as _opacitySchema } from 'km-shared';

// km-shared factories return structural $SchemaOf<T> types (IDE-safe).
// Cast back to real Zod types here (internal only — never reaches .d.ts).
const finiteNumber  = () => _finiteNumber()  as unknown as z.ZodNumber;
const opacitySchema = () => _opacitySchema() as unknown as z.ZodNumber;

import type {
  SvgViewBox,
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
  SvgDocument,
  SvgGeoMeta,
} from './types';

type ParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: { code: string; message: string; field?: string } };

/** Structural substitute for z.ZodType<T> - no Zod in .d.ts exports. */
type SchemaOf<T> = {
  readonly _zod: { readonly output: T };
  parse(data: unknown): T;
  safeParse(data: unknown): ParseResult<T>;
};

const colorChannel = () => z.number().int().min(0).max(255);

const _svgViewBoxSchema = z.object({ minX: finiteNumber(), minY: finiteNumber(), width: finiteNumber(), height: finiteNumber() });

const _svgLengthUnitSchema = z.enum(['px', 'pt', 'pc', 'mm', 'cm', 'in', 'em', 'ex', 'rem', 'vw', 'vh', '%', ''] as const);

const _svgLengthSchema = z.object({ value: finiteNumber(), unit: _svgLengthUnitSchema });

const _svgColorSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hex'),   value: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) }),
  z.object({ type: z.literal('rgb'),   r: colorChannel(), g: colorChannel(), b: colorChannel() }),
  z.object({ type: z.literal('rgba'),  r: colorChannel(), g: colorChannel(), b: colorChannel(), a: opacitySchema() }),
  z.object({ type: z.literal('named'), value: z.string().min(1) }),
  z.object({ type: z.literal('none') }),
]);

const _svgTransformOperationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('translate'), tx: finiteNumber(), ty: finiteNumber() }),
  z.object({ type: z.literal('scale'),     sx: finiteNumber(), sy: finiteNumber() }),
  z.object({ type: z.literal('rotate'),    angle: finiteNumber(), cx: finiteNumber().optional(), cy: finiteNumber().optional() }),
  z.object({ type: z.literal('skewX'),     angle: finiteNumber() }),
  z.object({ type: z.literal('skewY'),     angle: finiteNumber() }),
  z.object({ type: z.literal('matrix'),    a: finiteNumber(), b: finiteNumber(), c: finiteNumber(), d: finiteNumber(), e: finiteNumber(), f: finiteNumber() }),
]);

const _svgTransformSchema = z.array(_svgTransformOperationSchema);

const _svgPresentationAttributesSchema = z.object({
  fill: _svgColorSchema.optional(), fillOpacity: opacitySchema().optional(), fillRule: z.enum(['nonzero', 'evenodd']).optional(),
  stroke: _svgColorSchema.optional(), strokeWidth: _svgLengthSchema.optional(), strokeOpacity: opacitySchema().optional(),
  strokeLinecap: z.enum(['butt', 'round', 'square']).optional(), strokeLinejoin: z.enum(['miter', 'round', 'bevel', 'arcs', 'miter-clip']).optional(),
  strokeDasharray: z.array(finiteNumber()).optional(), strokeDashoffset: finiteNumber().optional(), strokeMiterlimit: finiteNumber().optional(),
  opacity: opacitySchema().optional(), display: z.string().optional(), visibility: z.enum(['visible', 'hidden', 'collapse']).optional(),
  clipPath: z.string().optional(), clipRule: z.enum(['nonzero', 'evenodd']).optional(), mask: z.string().optional(),
  filter: z.string().optional(), pointerEvents: z.string().optional(),
});

const _svgCoreAttributesSchema = z.object({
  id: z.string().optional(), className: z.string().optional(), style: z.string().optional(),
  transform: _svgTransformSchema.optional(), 'data-*': z.record(z.string(), z.string()).optional(),
});

const _svgBaseSchema = _svgCoreAttributesSchema.merge(_svgPresentationAttributesSchema);

const _svgPathElementSchema    = _svgBaseSchema.extend({ type: z.literal('path'), d: z.string() });
const _svgRectElementSchema    = _svgBaseSchema.extend({ type: z.literal('rect'),    x: finiteNumber(), y: finiteNumber(), width: finiteNumber(), height: finiteNumber(), rx: finiteNumber().optional(), ry: finiteNumber().optional() });
const _svgCircleElementSchema  = _svgBaseSchema.extend({ type: z.literal('circle'),  cx: finiteNumber(), cy: finiteNumber(), r:  finiteNumber() });
const _svgEllipseElementSchema = _svgBaseSchema.extend({ type: z.literal('ellipse'), cx: finiteNumber(), cy: finiteNumber(), rx: finiteNumber(), ry: finiteNumber() });
const _svgLineElementSchema    = _svgBaseSchema.extend({ type: z.literal('line'),    x1: finiteNumber(), y1: finiteNumber(), x2: finiteNumber(), y2: finiteNumber() });
const _svgPolylineElementSchema = _svgBaseSchema.extend({ type: z.literal('polyline'), points: z.array(z.tuple([finiteNumber(), finiteNumber()])) });
const _svgPolygonElementSchema  = _svgBaseSchema.extend({ type: z.literal('polygon'),  points: z.array(z.tuple([finiteNumber(), finiteNumber()])) });
const _svgTextElementSchema = _svgBaseSchema.extend({
  type: z.literal('text'), x: finiteNumber(), y: finiteNumber(), content: z.string(),
  fontSize: _svgLengthSchema.optional(), fontFamily: z.string().optional(),
  fontWeight: z.string().optional(), textAnchor: z.enum(['start', 'middle', 'end']).optional(),
});

const _svgGroupElementSchema: z.ZodType<SvgGroupElement> = _svgBaseSchema.extend({
  type: z.literal('g'),
  children: z.array(z.lazy(() => _svgElementSchema)),
}) as unknown as z.ZodType<SvgGroupElement>;

const _svgElementSchema: z.ZodType<SvgElement> = z.lazy(() =>
  z.discriminatedUnion('type', [
    _svgPathElementSchema, _svgRectElementSchema, _svgCircleElementSchema, _svgEllipseElementSchema,
    _svgLineElementSchema, _svgPolylineElementSchema, _svgPolygonElementSchema, _svgTextElementSchema,
    _svgGroupElementSchema as z.ZodType<SvgGroupElement> & z.ZodObject<{ type: z.ZodLiteral<'g'> }>,
  ])
) as z.ZodType<SvgElement>;

const _svgDocumentSchema = z.object({ viewBox: _svgViewBoxSchema.optional(), width: _svgLengthSchema.optional(), height: _svgLengthSchema.optional(), elements: z.array(_svgElementSchema) });

const _svgGeoMetaSchema = z.object({
  svgBounds: z.object({ minX: finiteNumber(), minY: finiteNumber(), maxX: finiteNumber(), maxY: finiteNumber() }),
  geoBounds: z.tuple([finiteNumber(), finiteNumber(), finiteNumber(), finiteNumber()]),
  crs: z.string().optional(),
});

// ─── Exported schemas (SchemaOf<T> — no Zod in .d.ts) ────────────────────────

export const SvgViewBoxSchema:                SchemaOf<SvgViewBox>                = _svgViewBoxSchema               as unknown as SchemaOf<SvgViewBox>;
export const SvgLengthUnitSchema:             SchemaOf<string>                    = _svgLengthUnitSchema            as unknown as SchemaOf<string>;
export const SvgLengthSchema:                 SchemaOf<SvgLength>                 = _svgLengthSchema                as unknown as SchemaOf<SvgLength>;
export const SvgColorSchema:                  SchemaOf<SvgColor>                  = _svgColorSchema                 as unknown as SchemaOf<SvgColor>;
export const SvgTransformOperationSchema:     SchemaOf<SvgTransformOperation>     = _svgTransformOperationSchema    as unknown as SchemaOf<SvgTransformOperation>;
export const SvgTransformSchema:              SchemaOf<SvgTransform>              = _svgTransformSchema             as unknown as SchemaOf<SvgTransform>;
export const SvgPresentationAttributesSchema: SchemaOf<SvgPresentationAttributes> = _svgPresentationAttributesSchema as unknown as SchemaOf<SvgPresentationAttributes>;
export const SvgCoreAttributesSchema:         SchemaOf<SvgCoreAttributes>         = _svgCoreAttributesSchema        as unknown as SchemaOf<SvgCoreAttributes>;
export const SvgPathElementSchema:            SchemaOf<SvgPathElement>            = _svgPathElementSchema           as unknown as SchemaOf<SvgPathElement>;
export const SvgRectElementSchema:            SchemaOf<SvgRectElement>            = _svgRectElementSchema           as unknown as SchemaOf<SvgRectElement>;
export const SvgCircleElementSchema:          SchemaOf<SvgCircleElement>          = _svgCircleElementSchema         as unknown as SchemaOf<SvgCircleElement>;
export const SvgEllipseElementSchema:         SchemaOf<SvgEllipseElement>         = _svgEllipseElementSchema        as unknown as SchemaOf<SvgEllipseElement>;
export const SvgLineElementSchema:            SchemaOf<SvgLineElement>            = _svgLineElementSchema           as unknown as SchemaOf<SvgLineElement>;
export const SvgPolylineElementSchema:        SchemaOf<SvgPolylineElement>        = _svgPolylineElementSchema       as unknown as SchemaOf<SvgPolylineElement>;
export const SvgPolygonElementSchema:         SchemaOf<SvgPolygonElement>         = _svgPolygonElementSchema        as unknown as SchemaOf<SvgPolygonElement>;
export const SvgTextElementSchema:            SchemaOf<SvgTextElement>            = _svgTextElementSchema           as unknown as SchemaOf<SvgTextElement>;
export const SvgGroupElementSchema:           SchemaOf<SvgGroupElement>           = _svgGroupElementSchema          as unknown as SchemaOf<SvgGroupElement>;
export const SvgElementSchema:                SchemaOf<SvgElement>                = _svgElementSchema               as unknown as SchemaOf<SvgElement>;
export const SvgDocumentSchema:               SchemaOf<SvgDocument>               = _svgDocumentSchema              as unknown as SchemaOf<SvgDocument>;
export const SvgGeoMetaSchema:                SchemaOf<SvgGeoMeta>                = _svgGeoMetaSchema               as unknown as SchemaOf<SvgGeoMeta>;
