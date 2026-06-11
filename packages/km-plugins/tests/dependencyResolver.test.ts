import { describe, it, expect } from 'vitest';
import { satisfiesVersion, resolveDependencyOrder } from '../src/dependencyResolver';
import { createPluginRegistry } from '../src/createPluginRegistry';
import type { Plugin } from '../src/types';

// ─── satisfiesVersion ─────────────────────────────────────────────────────────

describe('satisfiesVersion', () => {
  it('returns true when version is greater than the minimum', () => {
    expect(satisfiesVersion('1.2.3', '>=1.0.0')).toBe(true);
  });

  it('returns true when version equals the minimum (boundary is inclusive)', () => {
    expect(satisfiesVersion('1.0.0', '>=1.0.0')).toBe(true);
  });

  it('returns false when version is below the minimum', () => {
    expect(satisfiesVersion('0.9.0', '>=1.0.0')).toBe(false);
  });

  it('returns false when patch version is below minimum', () => {
    expect(satisfiesVersion('0.9.9', '>=1.0.0')).toBe(false);
  });

  it('returns true for patch version that satisfies range', () => {
    expect(satisfiesVersion('1.0.1', '>=1.0.0')).toBe(true);
  });

  it('correctly compares minor version differences', () => {
    expect(satisfiesVersion('1.1.0', '>=1.2.0')).toBe(false);
    expect(satisfiesVersion('1.3.0', '>=1.2.0')).toBe(true);
  });

  it('returns false for unsupported operator ">"', () => {
    expect(satisfiesVersion('2.0.0', '>1.0.0')).toBe(false);
  });

  it('returns false for unsupported operator "<"', () => {
    expect(satisfiesVersion('0.5.0', '<1.0.0')).toBe(false);
  });

  it('returns false for unsupported operator "^"', () => {
    expect(satisfiesVersion('1.2.3', '^1.0.0')).toBe(false);
  });

  it('returns false for unsupported operator "~"', () => {
    expect(satisfiesVersion('1.0.5', '~1.0.0')).toBe(false);
  });

  it('returns false for unsupported operator "<="', () => {
    expect(satisfiesVersion('1.0.0', '<=1.0.0')).toBe(false);
  });
});

// ─── resolveDependencyOrder ───────────────────────────────────────────────────

describe('resolveDependencyOrder', () => {
  const makePlugin = (id: string, deps: string[] = []): Plugin => ({
    id,
    name: id,
    version: '1.0.0',
    dependencies: deps.map((d) => ({ pluginId: d, minVersion: '>=1.0.0' })),
    setup: () => ({}),
  });

  it('returns a single plugin in a one-element list', () => {
    const result = resolveDependencyOrder([makePlugin('A')]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((p) => p.id)).toEqual(['A']);
  });

  it('sorts a linear chain into correct dependency order', () => {
    // A → B → C (C depends on B, B depends on A)
    const A = makePlugin('A');
    const B = makePlugin('B', ['A']);
    const C = makePlugin('C', ['B']);

    const result = resolveDependencyOrder([C, B, A]); // intentionally shuffled
    expect(result.success).toBe(true);
    if (!result.success) return;

    const order = result.data.map((p) => p.id);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
  });

  it('handles a diamond dependency graph correctly', () => {
    // A is depended on by B and C; D depends on both B and C.
    //   A
    //  / \
    // B   C
    //  \ /
    //   D
    const A = makePlugin('A');
    const B = makePlugin('B', ['A']);
    const C = makePlugin('C', ['A']);
    const D = makePlugin('D', ['B', 'C']);

    const result = resolveDependencyOrder([D, C, B, A]);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const order = result.data.map((p) => p.id);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('D'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });

  it('detects a simple cycle (A → B → A) and returns "circular-dependency"', () => {
    const A = makePlugin('A', ['B']);
    const B = makePlugin('B', ['A']);

    const result = resolveDependencyOrder([A, B]);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('circular-dependency');
  });

  it('detects a longer cycle (A → B → C → A)', () => {
    const A = makePlugin('A', ['C']);
    const B = makePlugin('B', ['A']);
    const C = makePlugin('C', ['B']);

    const result = resolveDependencyOrder([A, B, C]);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('circular-dependency');
  });

  it('returns plugins in the correct order for an independent set (no edges)', () => {
    const plugins = [makePlugin('X'), makePlugin('Y'), makePlugin('Z')];
    const result = resolveDependencyOrder(plugins);
    expect(result.success).toBe(true);
    if (!result.success) return;
    // All three must be present; order among independent nodes is arbitrary but all included.
    expect(result.data).toHaveLength(3);
    expect(result.data.map((p) => p.id)).toContain('X');
    expect(result.data.map((p) => p.id)).toContain('Y');
    expect(result.data.map((p) => p.id)).toContain('Z');
  });
});

// ─── registry integration — version checking ──────────────────────────────────

describe('registry integration — version checking', () => {
  it('registers plugin B that requires plugin A >=1.0.0 when A is 1.0.0', () => {
    const registry = createPluginRegistry();

    const A: Plugin = {
      id: 'com.test.a',
      name: 'A',
      version: '1.0.0',
      setup: () => ({}),
    };
    const B: Plugin = {
      id: 'com.test.b',
      name: 'B',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.a', minVersion: '>=1.0.0' }],
      setup: () => ({}),
    };

    registry.register(A);
    const result = registry.register(B);
    expect(result.success).toBe(true);
  });

  it('returns "version-mismatch" when A is 1.0.0 but B requires >=2.0.0', () => {
    const registry = createPluginRegistry();

    const A: Plugin = {
      id: 'com.test.a',
      name: 'A',
      version: '1.0.0',
      setup: () => ({}),
    };
    const B: Plugin = {
      id: 'com.test.b',
      name: 'B',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.a', minVersion: '>=2.0.0' }],
      setup: () => ({}),
    };

    registry.register(A);
    const result = registry.register(B);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('version-mismatch');
  });

  it('succeeds when A is 2.1.0 and B requires >=1.0.0 (higher version satisfies range)', () => {
    const registry = createPluginRegistry();

    const A: Plugin = {
      id: 'com.test.a',
      name: 'A',
      version: '2.1.0',
      setup: () => ({}),
    };
    const B: Plugin = {
      id: 'com.test.b',
      name: 'B',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.a', minVersion: '>=1.0.0' }],
      setup: () => ({}),
    };

    registry.register(A);
    const result = registry.register(B);
    expect(result.success).toBe(true);
  });
});
