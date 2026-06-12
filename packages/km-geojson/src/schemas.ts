/**
 * GeoJSON Zod v4 schemas — RFC 7946.
 *
 * Exported constants are annotated with local structural types (SchemaOf<T>)
 * so that generated .d.ts files never carry `import { z } from 'zod'`.
 * See .planning/zod_hang.md RULE 1, RULE 3, RULE 6.
 *
 * Validation rules enforced:
 * - LinearRing: minimum 4 positions, first === last (closed ring)
 * - LineString: minimum 2 positions
 * - BoundingBox: west <= east, south <= north
 * - GeoJsonGeometrySchema uses z.lazy() for recursive GeometryCollection
 */

import { z } from 'zod';
import type {
  Position,
  BoundingBox,
  LinearRing,
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
  GeoJson,
} from './types';

// ─── Local structural types (no Zod in .d.ts) ─────────────────────────────────

type ParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: { readonly issues: ReadonlyArray<{ readonly message: string }> } };

/** Structural substitute for z.ZodType<T> — never import from 'zod' for exports. */
type SchemaOf<T> = {
  readonly _zod: { readonly output: T };
  parse(data: unknown): T;
  safeParse(data: unknown): ParseResult<T>;
};

// ─── Internal Zod schemas (not exported — no .d.ts concern) ───────────────────

const _positionSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number()]),
]);

const _boundingBoxSchema = z.union([
  z
    .tuple([z.number(), z.number(), z.number(), z.number()])
    .refine(([west, south, east, north]) => west <= east && south <= north, {
      message: 'BoundingBox: west must be <= east and south must be <= north',
    }),
  z
    .tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()])
    .refine(([west, south, , east, north]) => west <= east && south <= north, {
      message: 'BoundingBox: west must be <= east and south must be <= north',
    }),
]);

const _linearRingSchema = z
  .array(_positionSchema)
  .min(4, { message: 'ring-too-short: a linear ring must have at least 4 positions' })
  .refine(
    (ring) => {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (!first || !last) return false;
      return first[0] === last[0] && first[1] === last[1];
    },
    { message: 'ring-not-closed: the first and last positions of a linear ring must be equal' },
  );

const _pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: _positionSchema,
  bbox: _boundingBoxSchema.optional(),
});

const _multiPointSchema = z.object({
  type: z.literal('MultiPoint'),
  coordinates: z.array(_positionSchema),
  bbox: _boundingBoxSchema.optional(),
});

const _lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z
    .array(_positionSchema)
    .min(2, { message: 'linestring-too-short: a LineString must have at least 2 positions' }),
  bbox: _boundingBoxSchema.optional(),
});

const _multiLineStringSchema = z.object({
  type: z.literal('MultiLineString'),
  coordinates: z.array(
    z
      .array(_positionSchema)
      .min(2, { message: 'linestring-too-short: each LineString must have at least 2 positions' }),
  ),
  bbox: _boundingBoxSchema.optional(),
});

const _polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(_linearRingSchema).min(1, { message: 'Polygon must have at least 1 ring' }),
  bbox: _boundingBoxSchema.optional(),
});

const _multiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(_linearRingSchema)),
  bbox: _boundingBoxSchema.optional(),
});

// Recursive schema — GeoJsonGeometrySchema is declared first (lazy closure).
// _geometryCollectionSchema is defined after and uses the already-initialized lazy wrapper.

const _geometrySchema: z.ZodType<GeoJsonGeometry> = z.lazy(() =>
  z.discriminatedUnion('type', [
    _pointSchema,
    _multiPointSchema,
    _lineStringSchema,
    _multiLineStringSchema,
    _polygonSchema,
    _multiPolygonSchema,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    _geometryCollectionSchema,
  ]),
) as unknown as z.ZodType<GeoJsonGeometry>;

const _geometryCollectionSchema = z.object({
  type: z.literal('GeometryCollection'),
  geometries: z.array(_geometrySchema),
  bbox: _boundingBoxSchema.optional(),
});

const _featureSchema = z.object({
  type: z.literal('Feature'),
  geometry: _geometrySchema.nullable(),
  properties: z.record(z.string(), z.unknown()).nullable(),
  id: z.union([z.string(), z.number()]).optional(),
  bbox: _boundingBoxSchema.optional(),
});

const _featureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(_featureSchema),
  bbox: _boundingBoxSchema.optional(),
});

const _geoJsonSchema = z.union([_geometrySchema, _featureSchema, _featureCollectionSchema]);

// ─── Exported schemas (SchemaOf<T> annotation — no Zod in .d.ts) ─────────────

/** Validates a GeoJSON position: [lng, lat] or [lng, lat, alt]. */
export const PositionSchema: SchemaOf<Position> =
  _positionSchema as unknown as SchemaOf<Position>;

/** Validates a GeoJSON bounding box with west <= east, south <= north. */
export const BoundingBoxSchema: SchemaOf<BoundingBox> =
  _boundingBoxSchema as unknown as SchemaOf<BoundingBox>;

/** Validates a closed linear ring (min 4 positions, first === last). */
export const LinearRingSchema: SchemaOf<LinearRing> =
  _linearRingSchema as unknown as SchemaOf<LinearRing>;

/** Validates a GeoJSON Point geometry. */
export const GeoJsonPointSchema: SchemaOf<GeoJsonPoint> =
  _pointSchema as unknown as SchemaOf<GeoJsonPoint>;

/** Validates a GeoJSON MultiPoint geometry. */
export const GeoJsonMultiPointSchema: SchemaOf<GeoJsonMultiPoint> =
  _multiPointSchema as unknown as SchemaOf<GeoJsonMultiPoint>;

/** Validates a GeoJSON LineString geometry (min 2 positions). */
export const GeoJsonLineStringSchema: SchemaOf<GeoJsonLineString> =
  _lineStringSchema as unknown as SchemaOf<GeoJsonLineString>;

/** Validates a GeoJSON MultiLineString geometry. */
export const GeoJsonMultiLineStringSchema: SchemaOf<GeoJsonMultiLineString> =
  _multiLineStringSchema as unknown as SchemaOf<GeoJsonMultiLineString>;

/** Validates a GeoJSON Polygon geometry (rings must be closed, min 4 positions each). */
export const GeoJsonPolygonSchema: SchemaOf<GeoJsonPolygon> =
  _polygonSchema as unknown as SchemaOf<GeoJsonPolygon>;

/** Validates a GeoJSON MultiPolygon geometry. */
export const GeoJsonMultiPolygonSchema: SchemaOf<GeoJsonMultiPolygon> =
  _multiPolygonSchema as unknown as SchemaOf<GeoJsonMultiPolygon>;

/** Validates a GeoJSON GeometryCollection (recursive). */
export const GeoJsonGeometryCollectionSchema: SchemaOf<GeoJsonGeometryCollection> =
  _geometryCollectionSchema as unknown as SchemaOf<GeoJsonGeometryCollection>;

/**
 * Validates any GeoJSON geometry (all 7 types).
 * Recursive via z.lazy() — handles nested GeometryCollections.
 */
export const GeoJsonGeometrySchema: SchemaOf<GeoJsonGeometry> =
  _geometrySchema as unknown as SchemaOf<GeoJsonGeometry>;

/** Validates a GeoJSON Feature with nullable geometry and properties. */
export const GeoJsonFeatureSchema: SchemaOf<
  GeoJsonFeature<GeoJsonGeometry | null, Record<string, unknown> | null>
> = _featureSchema as unknown as SchemaOf<
  GeoJsonFeature<GeoJsonGeometry | null, Record<string, unknown> | null>
>;

/** Validates a GeoJSON FeatureCollection. */
export const GeoJsonFeatureCollectionSchema: SchemaOf<
  GeoJsonFeatureCollection<GeoJsonGeometry | null, Record<string, unknown> | null>
> = _featureCollectionSchema as unknown as SchemaOf<
  GeoJsonFeatureCollection<GeoJsonGeometry | null, Record<string, unknown> | null>
>;

/** Validates any top-level GeoJSON value. */
export const GeoJsonSchema: SchemaOf<GeoJson> =
  _geoJsonSchema as unknown as SchemaOf<GeoJson>;
