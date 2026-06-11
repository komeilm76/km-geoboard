/**
 * importSvg — parse an SVG XML string into a typed SvgDocument.
 *
 * Wraps `parseSvgDocument` from `km-svg` in the `ImportResult` interface.
 * Unsupported SVG elements produce `ImportWarning` objects (not errors).
 */

import { parseSvgDocument } from 'km-svg';
import type { SvgDocument } from 'km-svg';
import type { ImportResult, ImportWarning } from './types';

// Tags that parseSvgDocument silently skips — we detect them in the raw string
// to emit ImportWarning entries. Must stay in sync with km-svg's SKIPPED_TAGS.
const SKIPPED_SVG_TAGS = [
  'defs', 'use', 'symbol', 'image', 'linearGradient', 'radialGradient',
  'pattern', 'marker', 'filter', 'mask', 'clipPath', 'style',
  'title', 'desc', 'metadata',
];

/**
 * Scan the raw SVG string for known-skipped element tags and return one
 * ImportWarning per unique tag found.
 */
function detectSkippedElements(svgString: string): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  for (const tag of SKIPPED_SVG_TAGS) {
    // Match opening tags: <image, <image , <image/>, etc.
    const re = new RegExp(`<${tag}[\\s/>]`, 'i');
    if (re.test(svgString)) {
      warnings.push({
        code: 'unsupported-svg-element',
        message: `SVG element <${tag}> is not supported and was skipped`,
        context: tag,
      });
    }
  }
  return warnings;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses an SVG XML string into a structured `SvgDocument`.
 *
 * Supported elements: path, rect, circle, ellipse, line, polyline, polygon, text, g.
 * Unsupported elements are ignored with an `ImportWarning`.
 *
 * @param svgString - Raw SVG XML string.
 * @returns ImportResult<SvgDocument>
 */
export function importSvg(svgString: string): ImportResult<SvgDocument> {
  // 1. Guard: empty input
  if (!svgString || svgString.trim() === '') {
    return {
      success: false,
      error: { code: 'empty-input', message: 'SVG string is empty' },
      warnings: [],
    };
  }

  // 2. Detect skipped elements before parsing (they get stripped silently)
  const warnings = detectSkippedElements(svgString);

  // 3. Parse via km-svg
  const result = parseSvgDocument(svgString);

  if (!result.success) {
    return {
      success: false,
      error: { code: 'invalid-xml', message: result.error.message },
      warnings,
    };
  }

  return { success: true, data: result.data, warnings };
}
