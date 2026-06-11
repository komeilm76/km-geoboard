import { describe, it, expect } from 'vitest';
import { importSvg } from '../src/importSvg';

// ─── Error paths ──────────────────────────────────────────────────────────────

describe('importSvg — errors', () => {
  it('returns empty-input for empty string', () => {
    const r = importSvg('');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
    expect(r.warnings).toEqual([]);
  });

  it('returns empty-input for whitespace-only string', () => {
    const r = importSvg('   ');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('empty-input');
  });

  it('returns invalid-xml for non-SVG XML (no <svg> root)', () => {
    // fast-xml-parser is lenient; a missing <svg> root is the reliable way to
    // trigger invalid-xml — parseSvgDocument checks for the <svg> key explicitly.
    const r = importSvg('<html><body></body></html>');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('invalid-xml');
  });

  it('returns invalid-xml for plain text (no XML tags)', () => {
    // Text with no XML tags → parseSvgDocument finds no <svg> root → invalid-xml
    const r = importSvg('this is not xml at all');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('invalid-xml');
  });
});

// ─── Valid SVG ────────────────────────────────────────────────────────────────

describe('importSvg — valid SVG', () => {
  it('parses a simple rect SVG with no warnings', () => {
    const svg = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.elements).toHaveLength(1);
      expect(r.data.elements[0]?.type).toBe('rect');
      expect(r.warnings).toEqual([]);
    }
  });

  it('parses a circle', () => {
    const svg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.elements[0]?.type).toBe('circle');
  });

  it('parses a path', () => {
    const svg = '<svg><path d="M 0 0 L 100 100"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.elements[0]?.type).toBe('path');
  });

  it('parses viewBox attribute', () => {
    const svg = '<svg viewBox="0 0 200 150"><rect x="0" y="0" width="10" height="10"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.viewBox?.width).toBe(200);
      expect(r.data.viewBox?.height).toBe(150);
    }
  });

  it('warnings array is always present even when empty', () => {
    const svg = '<svg><rect x="0" y="0" width="10" height="10"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) expect(Array.isArray(r.warnings)).toBe(true);
  });
});

// ─── Unsupported elements → warnings ─────────────────────────────────────────

describe('importSvg — unsupported elements emit warnings', () => {
  it('emits a warning for <image> element', () => {
    const svg = '<svg><rect x="0" y="0" width="10" height="10"/><image href="x.png"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      const imagWarning = r.warnings.find((w) => w.context === 'image');
      expect(imagWarning).toBeDefined();
      expect(imagWarning?.code).toBe('unsupported-svg-element');
    }
  });

  it('emits a warning for <use> element', () => {
    const svg = '<svg><use href="#x"/><circle cx="5" cy="5" r="5"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      const w = r.warnings.find((w) => w.context === 'use');
      expect(w).toBeDefined();
    }
  });

  it('emits a warning for <defs> element', () => {
    const svg = '<svg><defs><style>.c{fill:red}</style></defs><rect x="0" y="0" width="10" height="10"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      const w = r.warnings.find((w) => w.context === 'defs');
      expect(w).toBeDefined();
    }
  });

  it('still succeeds with supported elements present alongside unsupported ones', () => {
    const svg = '<svg><rect x="0" y="0" width="10" height="10"/><image href="x.png"/></svg>';
    const r = importSvg(svg);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.elements.length).toBeGreaterThan(0);
      expect(r.warnings.length).toBeGreaterThan(0);
    }
  });

  it('warnings present on error branches too', () => {
    const r = importSvg('');
    expect(Array.isArray(r.warnings)).toBe(true);
  });
});
