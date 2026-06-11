/**
 * importArtboardSnapshot — parse a serialized artboard array into Artboard[].
 *
 * Validates the raw input against z.array(ArtboardSchema) from km-artboard.
 * Zod is used inside the function body only — never leaks to .d.ts.
 */

import { z } from 'zod';
import { ArtboardSchema } from 'km-artboard';
import type { Artboard } from 'km-artboard';
import type { ImportResult } from './types';

// Internal Zod array schema — kept inside the module, never exported.
// ArtboardSchema uses the SchemaOf structural type, but at runtime it IS a real
// Zod schema, so we can cast and compose it safely inside the body.
const _artboardArraySchema = z.array(ArtboardSchema as unknown as z.ZodType<Artboard>);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a JSON string or object produced by the artboard package.
 *
 * Validates the input as an array of Artboard objects.
 *
 * @param raw - JSON string or plain object.
 * @returns ImportResult<Artboard[]>
 */
export function importArtboardSnapshot(raw: string | unknown): ImportResult<Artboard[]> {
  // 1. Guard: empty input
  if (raw === null || raw === undefined || raw === '') {
    return {
      success: false,
      error: { code: 'empty-input', message: 'Input is null, undefined, or empty string' },
      warnings: [],
    };
  }

  // 2. Parse JSON string
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return {
        success: false,
        error: { code: 'invalid-json', message: 'Failed to parse JSON string' },
        warnings: [],
      };
    }
  }

  // 3. Validate against artboard array schema
  const result = _artboardArraySchema.safeParse(value);
  if (!result.success) {
    return {
      success: false,
      error: { code: 'schema-mismatch', message: 'Input is not a valid Artboard array' },
      warnings: [],
    };
  }

  return { success: true, data: result.data, warnings: [] };
}
