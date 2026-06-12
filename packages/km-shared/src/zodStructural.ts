/**
 * IDE-safe structural substitutes for Zod types.
 *
 * These types mirror the internal shape of Zod v4.4.x objects without
 * importing from 'zod'. Using them as generic constraints in exported
 * function signatures prevents the IDE hang described in .planning/zod_hang.md.
 *
 * NEVER replace these with `z.ZodObject<any>` or `z.ZodTypeAny` in exported
 * signatures. Inside function bodies, cast freely:
 *   const _s = schema as unknown as z.ZodObject<any>;
 *
 * Compatible with: Zod v4.4.x (uses `_zod.output` internal field).
 * If Zod changes this field name in a future major version, update these types.
 */

/**
 * Local structural substitute for `z.ZodObject<any>`.
 * Use as a generic constraint in all exported function signatures that accept
 * an object schema.
 *
 * @example
 * ```ts
 * // ✅ Safe — no Zod import in .d.ts
 * export function withSchema<S extends $AnyZodObject>(schema: S): S['_zod']['output'] { ... }
 *
 * // ❌ Dangerous — causes IDE hang for consumers
 * export function withSchema<S extends z.ZodObject<any>>(schema: S): z.infer<S> { ... }
 * ```
 */
export type $AnyZodObject = {
  readonly _zod: { readonly output: Record<string, unknown> };
  shape: Record<string, unknown>;
};

/**
 * Local structural substitute for `z.ZodTypeAny`.
 * Use as a generic constraint in all exported function signatures that accept
 * any schema type.
 *
 * @example
 * ```ts
 * // ✅ Safe — no Zod import in .d.ts
 * export function parse<T extends $AnyZodType>(schema: T, data: unknown): T['_zod']['output'] { ... }
 *
 * // ❌ Dangerous — causes IDE hang for consumers
 * export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> { ... }
 * ```
 */
export type $AnyZodType = {
  readonly _zod: { readonly output: unknown };
};

/**
 * Structural result of `safeParse` — mirrors Zod's SafeParseReturnType
 * without importing from 'zod'.
 */
export type $ParseResult<T> =
  | { readonly success: true; readonly data: T }
  | {
      readonly success: false;
      readonly error: { readonly issues: ReadonlyArray<{ readonly message: string }> };
    };

/**
 * Structural substitute for `z.ZodType<T>` in exported signatures.
 * A real Zod schema always satisfies this shape; consumers can call
 * `parse` / `safeParse` without any Zod import appearing in .d.ts files.
 *
 * Inside a consuming package's internal code, cast back when Zod chaining
 * is needed:
 * ```ts
 * const s = nonEmptyString() as unknown as z.ZodString;
 * s.optional().default('x');
 * ```
 */
export type $SchemaOf<T> = {
  readonly _zod: { readonly output: T };
  parse(data: unknown): T;
  safeParse(data: unknown): $ParseResult<T>;
};
