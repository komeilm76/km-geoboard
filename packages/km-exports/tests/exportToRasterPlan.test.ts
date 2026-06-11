import { describe, it, expect } from 'vitest';
import { exportToRasterPlan } from '../src/exportToRasterPlan';
import type {
  Artboard,
  SvgElement,
  SvgRectElement,
  SvgCircleElement,
  SvgTextElement,
} from '../src/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtboard(width = 200, height = 100): Artboard {
  return {
    id: 'ab1',
    name: 'Test',
    origin: { x: 0, y: 0 },
    size: { width, height },
    startPoint: { x: 0, y: 0 },
    endPoint: { x: width, y: height },
    createdAt: 0,
  };
}

const rectEl: SvgRectElement = { type: 'rect', x: 10, y: 20, width: 50, height: 30 };
const circleEl: SvgCircleElement = { type: 'circle', cx: 40, cy: 40, r: 20 };
const textEl: SvgTextElement = {
  type: 'text', x: 10, y: 30, content: 'Hi',
  fontSize: { value: 14, unit: 'px' }, fontFamily: 'Arial',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('exportToRasterPlan', () => {
  it('returns a Result<RasterExportPlan> on success', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png');
    expect(result.success).toBe(true);
  });

  it('canvas dimensions equal artboard size * scale (default scale 1)', () => {
    const result = exportToRasterPlan(makeArtboard(200, 100), [rectEl], 'png');
    if (!result.success) return;
    expect(result.data.canvasWidth).toBe(200);
    expect(result.data.canvasHeight).toBe(100);
  });

  it('canvas dimensions are rounded to integer when scale is fractional', () => {
    const result = exportToRasterPlan(makeArtboard(100, 100), [rectEl], 'png', 1.5);
    if (!result.success) return;
    expect(result.data.canvasWidth).toBe(150);
    expect(result.data.canvasHeight).toBe(150);
  });

  it('scale: 2 doubles all coordinate values for rect', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png', 2);
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'rect');
    expect(instr).toBeDefined();
    if (!instr || instr.type !== 'rect') return;
    expect(instr.x).toBe(rectEl.x * 2);
    expect(instr.y).toBe(rectEl.y * 2);
    expect(instr.w).toBe(rectEl.width * 2);
    expect(instr.h).toBe(rectEl.height * 2);
  });

  it('scale: 1 (default) preserves coordinate values for rect', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png', 1);
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'rect');
    if (!instr || instr.type !== 'rect') return;
    expect(instr.x).toBe(rectEl.x);
    expect(instr.y).toBe(rectEl.y);
  });

  it('SvgRectElement produces a rect instruction', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png');
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'rect');
    expect(instr).toBeDefined();
  });

  it('SvgCircleElement produces a circle instruction', () => {
    const result = exportToRasterPlan(makeArtboard(), [circleEl], 'png');
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'circle');
    expect(instr).toBeDefined();
    if (!instr || instr.type !== 'circle') return;
    expect(instr.cx).toBe(circleEl.cx);
    expect(instr.cy).toBe(circleEl.cy);
    expect(instr.r).toBe(circleEl.r);
  });

  it('SvgTextElement produces a text instruction with font string', () => {
    const result = exportToRasterPlan(makeArtboard(), [textEl], 'png');
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'text');
    expect(instr).toBeDefined();
    if (!instr || instr.type !== 'text') return;
    expect(instr.content).toBe('Hi');
    expect(instr.font).toContain('14px');
    expect(instr.font).toContain('Arial');
  });

  it('SvgPathElement produces a path instruction', () => {
    const el: SvgElement = { type: 'path', d: 'M 0 0 L 50 50' };
    const result = exportToRasterPlan(makeArtboard(), [el], 'png');
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'path');
    expect(instr).toBeDefined();
  });

  it('format: png → quality is undefined', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png');
    if (!result.success) return;
    expect(result.data.quality).toBeUndefined();
  });

  it('format: jpeg → quality is 0.92', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'jpeg');
    if (!result.success) return;
    expect(result.data.quality).toBe(0.92);
  });

  it('background defaults to #ffffff', () => {
    const result = exportToRasterPlan(makeArtboard(), [rectEl], 'png');
    if (!result.success) return;
    expect(result.data.background).toBe('#ffffff');
  });

  it('returns empty-export error when filter removes all elements', () => {
    const result = exportToRasterPlan(
      makeArtboard(),
      [{ ...rectEl, id: 'r1' }],
      'png',
      1,
      { includeIds: ['nonexistent'] },
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('empty-export');
  });

  it('group element children are flattened into instructions', () => {
    const group: SvgElement = { type: 'g', children: [rectEl, circleEl] };
    const result = exportToRasterPlan(makeArtboard(), [group], 'png');
    if (!result.success) return;
    const types = result.data.instructions.map((i) => i.type);
    expect(types).toContain('rect');
    expect(types).toContain('circle');
  });

  it('polyline produces a path instruction', () => {
    const el: SvgElement = { type: 'polyline', points: [[0, 0], [10, 10], [20, 0]] };
    const result = exportToRasterPlan(makeArtboard(), [el], 'png');
    if (!result.success) return;
    expect(result.data.instructions.find((i) => i.type === 'path')).toBeDefined();
  });

  it('polygon produces a path instruction with Z', () => {
    const el: SvgElement = { type: 'polygon', points: [[0, 0], [10, 0], [5, 10]] };
    const result = exportToRasterPlan(makeArtboard(), [el], 'png');
    if (!result.success) return;
    const instr = result.data.instructions.find((i) => i.type === 'path');
    expect(instr).toBeDefined();
    if (!instr || instr.type !== 'path') return;
    expect(instr.d).toContain('Z');
  });
});
