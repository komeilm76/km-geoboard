/**
 * A discriminated union representing the outcome of a fallible operation.
 * On success, `data` holds the result.
 * On failure, `error` holds a structured error with a machine-readable code.
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) return { success: false, error: { code: 'divide-by-zero', message: 'Cannot divide by zero' } };
 *   return { success: true, data: a / b };
 * }
 * const result = divide(10, 2);
 * if (result.success) console.log(result.data); // 5
 * ```
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ResultError };

/**
 * Structured error returned inside a failed `Result`.
 */
export type ResultError = {
  /** Machine-readable error code — use kebab-case. */
  code: string;
  /** Human-readable description of what went wrong. */
  message: string;
  /** The input field that caused the failure, if applicable. */
  field?: string;
};
