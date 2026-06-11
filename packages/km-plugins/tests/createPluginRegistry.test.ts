import { describe, it, expect, vi } from 'vitest';
import { createPluginRegistry } from '../src/createPluginRegistry';
import type { Plugin } from '../src/types';

// ─── Test fixtures ────────────────────────────────────────────────────────────

type GreeterApi = { greet: (name: string) => string };
type CounterApi = { increment: () => number };

const makeGreeterPlugin = (id = 'com.test.greeter'): Plugin<GreeterApi> => ({
  id,
  name: 'Greeter',
  version: '1.0.0',
  setup(_deps) {
    return { greet: (name) => `Hello, ${name}!` };
  },
});

const makeCounterPlugin = (): Plugin<CounterApi> => {
  let count = 0;
  return {
    id: 'com.test.counter',
    name: 'Counter',
    version: '1.0.0',
    setup(_deps) {
      return { increment: () => ++count };
    },
  };
};

// ─── register — success paths ─────────────────────────────────────────────────

describe('register', () => {
  it('registers a plugin with no dependencies and returns success', () => {
    const registry = createPluginRegistry();
    const result = registry.register(makeGreeterPlugin());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.plugin.id).toBe('com.test.greeter');
    expect(result.data.status).toBe('active');
  });

  it('has() returns true after registration', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    expect(registry.has('com.test.greeter')).toBe(true);
  });

  it('has() returns false for an unregistered plugin', () => {
    const registry = createPluginRegistry();
    expect(registry.has('com.test.nonexistent')).toBe(false);
  });

  it('getApi() returns the setup result', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    const api = registry.getApi<GreeterApi>('com.test.greeter');
    expect(api).not.toBeNull();
    expect(api?.greet('world')).toBe('Hello, world!');
  });

  it('getApi() returns null for an unregistered plugin', () => {
    const registry = createPluginRegistry();
    expect(registry.getApi('com.test.nonexistent')).toBeNull();
  });

  it('list() returns all registered plugins', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    registry.register(makeCounterPlugin());
    const list = registry.list();
    expect(list).toHaveLength(2);
    expect(list.map((r) => r.plugin.id)).toContain('com.test.greeter');
    expect(list.map((r) => r.plugin.id)).toContain('com.test.counter');
  });

  it('registers a plugin with a satisfied required dependency', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());

    const consumerPlugin: Plugin = {
      id: 'com.test.consumer',
      name: 'Consumer',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.greeter', minVersion: '>=1.0.0' }],
      setup(deps) {
        const greeter = deps.get('com.test.greeter') as GreeterApi;
        return { message: greeter.greet('plugin') };
      },
    };

    const result = registry.register(consumerPlugin);
    expect(result.success).toBe(true);
  });

  it('passes resolved dependency APIs into setup via PluginDepsMap', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());

    const plugin: Plugin<{ msg: string }> = {
      id: 'com.test.user',
      name: 'User',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.greeter', minVersion: '>=1.0.0' }],
      setup(deps) {
        const greeter = deps.get('com.test.greeter') as GreeterApi;
        return { msg: greeter.greet('deps') };
      },
    };

    const result = registry.register(plugin);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.api.msg).toBe('Hello, deps!');
  });

  it('allows registration when an optional dependency is missing', () => {
    const registry = createPluginRegistry();

    const plugin: Plugin = {
      id: 'com.test.optional-consumer',
      name: 'Optional Consumer',
      version: '1.0.0',
      dependencies: [
        { pluginId: 'com.test.nonexistent', minVersion: '>=1.0.0', optional: true },
      ],
      setup(_deps) {
        return { ok: true };
      },
    };

    const result = registry.register(plugin);
    expect(result.success).toBe(true);
  });
});

// ─── register — error paths ───────────────────────────────────────────────────

describe('register — error paths', () => {
  it('returns "already-registered" when a plugin with the same ID is already registered', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    const result = registry.register(makeGreeterPlugin());

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('already-registered');
  });

  it('returns "conflict" when a conflicting plugin is already registered', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());

    const conflictingPlugin: Plugin = {
      id: 'com.test.rival',
      name: 'Rival',
      version: '1.0.0',
      conflicts: [
        {
          pluginId: 'com.test.greeter',
          reason: 'Cannot use Greeter and Rival at the same time.',
        },
      ],
      setup(_deps) {
        return {};
      },
    };

    const result = registry.register(conflictingPlugin);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('conflict');
    expect(result.error.message).toContain('Cannot use Greeter and Rival at the same time.');
  });

  it('returns "missing-dependency" when a required dependency is not registered', () => {
    const registry = createPluginRegistry();

    const plugin: Plugin = {
      id: 'com.test.needy',
      name: 'Needy',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.missing', minVersion: '>=1.0.0' }],
      setup(_deps) {
        return {};
      },
    };

    const result = registry.register(plugin);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('missing-dependency');
  });

  it('returns "version-mismatch" when a dependency version does not satisfy the requirement', () => {
    const registry = createPluginRegistry();

    const oldPlugin: Plugin = {
      id: 'com.test.dep',
      name: 'Dep',
      version: '0.9.0',
      setup(_deps) {
        return {};
      },
    };
    registry.register(oldPlugin);

    const requiresNewVersion: Plugin = {
      id: 'com.test.requirer',
      name: 'Requirer',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.dep', minVersion: '>=1.0.0' }],
      setup(_deps) {
        return {};
      },
    };

    const result = registry.register(requiresNewVersion);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('version-mismatch');
  });

  it('returns "setup-error" when plugin.setup throws', () => {
    const registry = createPluginRegistry();

    const badPlugin: Plugin = {
      id: 'com.test.broken',
      name: 'Broken',
      version: '1.0.0',
      setup(_deps) {
        throw new Error('setup exploded');
      },
    };

    const result = registry.register(badPlugin);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('setup-error');
    expect(result.error.message).toContain('setup exploded');
  });
});

// ─── unregister ───────────────────────────────────────────────────────────────

describe('unregister', () => {
  it('unregisters a plugin and has() returns false afterward', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    const result = registry.unregister('com.test.greeter');

    expect(result.success).toBe(true);
    expect(registry.has('com.test.greeter')).toBe(false);
  });

  it('calls teardown when unregistering a plugin that has one', () => {
    const registry = createPluginRegistry();
    const teardown = vi.fn();

    const plugin: Plugin = {
      id: 'com.test.teardownable',
      name: 'Teardownable',
      version: '1.0.0',
      setup(_deps) {
        return {};
      },
      teardown,
    };

    registry.register(plugin);
    registry.unregister('com.test.teardownable');

    expect(teardown).toHaveBeenCalledOnce();
  });

  it('returns "not-found" when unregistering an unknown plugin', () => {
    const registry = createPluginRegistry();
    const result = registry.unregister('com.test.ghost');

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('not-found');
  });

  it('returns "dependency-active" when another plugin depends on the target', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());

    const dependent: Plugin = {
      id: 'com.test.dependent',
      name: 'Dependent',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.greeter', minVersion: '>=1.0.0' }],
      setup(_deps) {
        return {};
      },
    };
    registry.register(dependent);

    const result = registry.unregister('com.test.greeter');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('dependency-active');
  });

  it('allows unregistering a dependency after its dependent is removed first', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());

    const dependent: Plugin = {
      id: 'com.test.dependent',
      name: 'Dependent',
      version: '1.0.0',
      dependencies: [{ pluginId: 'com.test.greeter', minVersion: '>=1.0.0' }],
      setup(_deps) {
        return {};
      },
    };
    registry.register(dependent);

    registry.unregister('com.test.dependent');
    const result = registry.unregister('com.test.greeter');
    expect(result.success).toBe(true);
  });
});

// ─── reset ────────────────────────────────────────────────────────────────────

describe('reset', () => {
  it('clears all registrations', () => {
    const registry = createPluginRegistry();
    registry.register(makeGreeterPlugin());
    registry.register(makeCounterPlugin());
    registry.reset();

    expect(registry.list()).toHaveLength(0);
    expect(registry.has('com.test.greeter')).toBe(false);
    expect(registry.has('com.test.counter')).toBe(false);
  });

  it('calls teardown on all plugins', () => {
    const registry = createPluginRegistry();
    const teardownA = vi.fn();
    const teardownB = vi.fn();

    const pluginA: Plugin = {
      id: 'com.test.a',
      name: 'A',
      version: '1.0.0',
      setup: () => ({}),
      teardown: teardownA,
    };
    const pluginB: Plugin = {
      id: 'com.test.b',
      name: 'B',
      version: '1.0.0',
      setup: () => ({}),
      teardown: teardownB,
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.reset();

    expect(teardownA).toHaveBeenCalledOnce();
    expect(teardownB).toHaveBeenCalledOnce();
  });

  it('calls teardown in reverse registration order', () => {
    const registry = createPluginRegistry();
    const order: string[] = [];

    const pluginA: Plugin = {
      id: 'com.test.first',
      name: 'First',
      version: '1.0.0',
      setup: () => ({}),
      teardown: () => order.push('first'),
    };
    const pluginB: Plugin = {
      id: 'com.test.second',
      name: 'Second',
      version: '1.0.0',
      setup: () => ({}),
      teardown: () => order.push('second'),
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.reset();

    expect(order).toEqual(['second', 'first']);
  });

  it('does not throw if a teardown function throws', () => {
    const registry = createPluginRegistry();

    const badPlugin: Plugin = {
      id: 'com.test.bad-teardown',
      name: 'Bad Teardown',
      version: '1.0.0',
      setup: () => ({}),
      teardown: () => {
        throw new Error('teardown failure');
      },
    };

    registry.register(badPlugin);
    expect(() => registry.reset()).not.toThrow();
  });
});
