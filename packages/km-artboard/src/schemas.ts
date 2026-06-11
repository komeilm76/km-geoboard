/**
 * Zod v4 schemas for artboard domain inputs and entities.
 *
 * Exported constants are annotated with local structural types so that
 * generated .d.ts files never carry `import { z } from 'zod'`.
 * See zod_hang.md RULE 1, RULE 3, RULE 6.
 */

import { z } from 'zod';
import {
  finiteNumber as _finiteNumber,
  nonEmptyString as _nonEmptyString,
  uuid as _uuid,
} from '@komeilm76/km-shared';

// km-shared factories return structural $SchemaOf<T> types (IDE-safe).
// Cast back to real Zod types here (internal only — never reaches .d.ts)
// so chaining (.optional(), .positive(), ...) and z.object embedding work.
const finiteNumber   = () => _finiteNumber()   as unknown as z.ZodNumber;
const nonEmptyString = () => _nonEmptyString() as unknown as z.ZodString;
const uuid           = () => _uuid()           as unknown as z.ZodString;
import type { Artboard, CreateArtboardInput } from './types';

// ─── Local structural types (never import from 'zod') ────────────────────────

type ParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: { readonly issues: ReadonlyArray<{ readonly message: string }> } };

/** Structural substitute for z.ZodType<T> — no Zod import needed in .d.ts. */
type SchemaOf<T> = {
  readonly _zod: { readonly output: T };
  parse(data: unknown): T;
  safeParse(data: unknown): ParseResult<T>;
};

// ─── Primitive schemas (internal) ─────────────────────────────────────────────

const PointSchema = z.object({ x: finiteNumber(), y: finiteNumber() });
const SizeSchema  = z.object({ width: finiteNumber(), height: finiteNumber() });

// ─── Input schema ─────────────────────────────────────────────────────────────

type CreateArtboardInputParsed =
  Required<Pick<CreateArtboardInput, 'startPoint' | 'endPoint'>> & {
    name: string;
    id: string | undefined;
    minSize: number;
  };

const _inputSchemaZod = z.object({
  startPoint: PointSchema,
  endPoint:   PointSchema,
  name:       nonEmptyString().optional().default('Artboard'),
  id:         uuid().optional(),
  minSize:    finiteNumber().positive().optional().default(1),
});

/** Validates CreateArtboardInput with defaults. Structural type — no Zod in .d.ts. */
export const CreateArtboardInputSchema: SchemaOf<CreateArtboardInputParsed> =
  _inputSchemaZod as unknown as SchemaOf<CreateArtboardInputParsed>;

// ─── Entity schema ────────────────────────────────────────────────────────────

const _artboardSchemaZod = z.object({
  id:         uuid(),
  name:       nonEmptyString(),
  origin:     PointSchema,
  size:       SizeSchema,
  startPoint: PointSchema,
  endPoint:   PointSchema,
  createdAt:  z.number().int().min(0).safe(),
});

// ─── Type-divergence guard ────────────────────────────────────────────────────

type _Inferred = z.infer<typeof _artboardSchemaZod>;
type _Guard =
  _Inferred extends Artboard
    ? Artboard extends _Inferred
      ? true
      : never
    : never;
const _ok: _Guard = true;
void _ok;

/** Validates a fully-formed Artboard. Structural type — no Zod in .d.ts. */
export const ArtboardSchema: SchemaOf<Artboard> =
  _artboardSchemaZod as unknown as SchemaOf<Artboard>;
