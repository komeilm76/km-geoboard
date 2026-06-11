/**
 * @file exportToPdfMeta.ts
 * Produces a PdfMeta descriptor for consumer-side PDF generation.
 *
 * This function does NOT generate a PDF. It produces the `PdfMeta` data object
 * that a consumer passes to a PDF library (jsPDF, PDFKit, pdfmake).
 */

import type { Result, Artboard, SvgElement, ExportFilter, PdfMeta } from './types';
import { exportToSvg } from './exportToSvg';

// ─── Page size constants (in PDF points — 1 pt = 1/72 inch) ──────────────────

const PAGE_SIZES = {
  A4:     { width: 595.28,  height: 841.89 },
  A3:     { width: 841.89,  height: 1190.55 },
  Letter: { width: 612,     height: 792 },
  Legal:  { width: 612,     height: 1008 },
} as const;

type NamedPageSize = keyof typeof PAGE_SIZES;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Produces a {@link PdfMeta} object for consumer-side PDF generation.
 *
 * The `svgContent` field contains a self-contained SVG string whose `viewBox`
 * uses artboard canvas units. The PDF library is responsible for scaling the
 * SVG to fit the page — this function provides both pieces of information
 * (SVG and `pageSize`) in one object.
 *
 * @param artboard   - The artboard to export.
 * @param elements   - SVG elements on the artboard.
 * @param options    - Page size, orientation, and optional metadata.
 * @returns `Result<PdfMeta>` — the PDF descriptor or an error.
 *
 * @example
 * const result = exportToPdfMeta(artboard, elements, { pageSize: 'A4', orientation: 'landscape' });
 * if (result.success) {
 *   const doc = new jsPDF({ format: [result.data.pageSize.width, result.data.pageSize.height] });
 *   doc.addSvgAsImage(result.data.svgContent, 0, 0, result.data.pageSize.width, result.data.pageSize.height);
 * }
 */
export function exportToPdfMeta(
  artboard: Artboard,
  elements: SvgElement[],
  options?: {
    /**
     * Standard page size name or a custom `{ width, height }` in PDF points.
     * @default "A4"
     */
    pageSize?: NamedPageSize | { width: number; height: number };
    /**
     * Page orientation.
     * @default "portrait"
     */
    orientation?: 'portrait' | 'landscape';
    /** Optional document title metadata. */
    title?: string;
    /** Optional document author metadata. */
    author?: string;
    /** Optional element filter. */
    filter?: ExportFilter;
  },
): Result<PdfMeta> {
  const {
    pageSize = 'A4',
    orientation = 'portrait',
    title,
    author,
    filter,
  } = options ?? {};

  // Resolve page dimensions
  let resolvedWidth: number;
  let resolvedHeight: number;

  if (typeof pageSize === 'string') {
    const dims = PAGE_SIZES[pageSize];
    resolvedWidth  = dims.width;
    resolvedHeight = dims.height;
  } else {
    resolvedWidth  = pageSize.width;
    resolvedHeight = pageSize.height;
  }

  // Apply orientation — swap if landscape and width < height
  if (orientation === 'landscape' && resolvedWidth < resolvedHeight) {
    const tmp = resolvedWidth;
    resolvedWidth  = resolvedHeight;
    resolvedHeight = tmp;
  }

  // Generate SVG content (no XML declaration — the PDF library doesn't need it)
  const svgResult = exportToSvg({ artboard, elements, xmlDeclaration: false, ...(filter !== undefined ? { filter } : {}) });
  if (!svgResult.success) return svgResult;

  return {
    success: true,
    data: {
      pageSize: { width: resolvedWidth, height: resolvedHeight },
      orientation,
      svgContent: svgResult.data,
      artboard,
      ...(title !== undefined ? { title } : {}),
      ...(author !== undefined ? { author } : {}),
    },
  };
}
