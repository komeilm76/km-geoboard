/**
 * @file types.ts
 * All TypeScript types for the km-plugins plugin system.
 * No Zod imports — pure TypeScript types only.
 */

// ─── Result<T> (local copy — will be sourced from km-shared once available) ──

/**
 * A machine-readable error returned by operations that can fail.
 */
export type ResultError = {
  /** Machine-readable failure code, e.g. "conflict", "missing-dependency". */
  code: string;
  /** Human-readable description of what went wrong. */
  message: string;
  /** Which input field caused the failure, if applicable. */
  field?: string;
};

/**
 * Discriminated union result — every fallible function returns this instead of throwing.
 *
 * @example
 * const result = registry.register(plugin);
 * if (!result.success) {
 *   console.error(result.error.code);
 *   return;
 * }
 * const registration = result.data;
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ResultError };

// ─── Plugin primitives ────────────────────────────────────────────────────────

/**
 * Unique plugin identifier.
 * Reverse-domain notation is recommended to avoid collisions.
 * @example "com.yourproject.artboard", "com.yourproject.map.tiles"
 */
export type PluginId = string;

/**
 * Semantic version string for a plugin.
 * @example "1.0.0", "2.3.1"
 */
export type PluginVersion = string;

// ─── Dependency & conflict declarations ───────────────────────────────────────

/**
 * Declares that a plugin depends on another plugin.
 */
export type PluginDependency = {
  /** The plugin ID this plugin depends on. */
  pluginId: PluginId;

  /**
   * Minimum required version (inclusive), expressed as a semver range.
   * Currently only `">=X.Y.Z"` is supported.
   * @example ">=1.0.0"
   */
  minVersion: string;

  /**
   * Whether this dependency is optional.
   * When `true` and the dependency is not registered, the plugin loads without it.
   * @default false
   */
  optional?: boolean;
};

/**
 * Declares that a plugin conflicts with another plugin.
 * If the listed plugin is already registered, registration fails.
 */
export type PluginConflict = {
  /** A plugin ID that must NOT be present when this plugin is registered. */
  pluginId: PluginId;
  /** Human-readable reason for the conflict, included in the error message. */
  reason: string;
};

// ─── Dependency map ───────────────────────────────────────────────────────────

/**
 * Map of resolved dependency APIs, keyed by plugin ID.
 * Passed to `Plugin.setup` at registration time.
 *
 * Each plugin is responsible for casting the value to its specific API type:
 * ```ts
 * const coordApi = deps.get("com.project.coords") as CoordApi;
 * ```
 * This avoids circular type references between plugin definitions.
 */
export type PluginDepsMap = Map<PluginId, Record<string, unknown>>;

// ─── Plugin definition ────────────────────────────────────────────────────────

/**
 * A plugin definition.
 * `API` is the shape of the public interface this plugin exposes to the registry.
 *
 * @example
 * const myPlugin: Plugin<{ greet: (name: string) => string }> = {
 *   id: "com.project.greeter",
 *   name: "Greeter",
 *   version: "1.0.0",
 *   setup(_deps) {
 *     return { greet: (name) => `Hello, ${name}!` };
 *   },
 * };
 */
export type Plugin<API extends Record<string, unknown> = Record<string, unknown>> = {
  /** Unique plugin identifier. Reverse-domain notation recommended. */
  id: PluginId;

  /** Plugin display name for debugging and documentation. */
  name: string;

  /** Plugin version string (semver). */
  version: PluginVersion;

  /**
   * Declared dependencies. The registry resolves these before calling `setup`.
   * Registration fails if any required dependency is missing or version-mismatched.
   */
  dependencies?: PluginDependency[];

  /**
   * Plugins this plugin cannot coexist with.
   * If any listed plugin is already registered, registration fails.
   */
  conflicts?: PluginConflict[];

  /**
   * Called by the registry after all dependencies are resolved.
   * Must return the plugin's public API object, which becomes accessible via `getApi`.
   *
   * @param deps - Map from dependency plugin ID to that plugin's resolved API.
   * @returns The plugin's public API.
   */
  setup(deps: PluginDepsMap): API;

  /**
   * Called when the plugin is unregistered or the registry is reset.
   * Use to clean up timers, close connections, release resources, etc.
   */
  teardown?(): void;
};

// ─── Registration record ──────────────────────────────────────────────────────

/**
 * A registered plugin — the plugin definition paired with its resolved public API.
 */
export type PluginRegistration<
  API extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** The original plugin definition. */
  plugin: Plugin<API>;
  /** The API object returned by `plugin.setup`. */
  api: API;
  /** Whether the plugin is active or encountered an error. */
  status: 'active' | 'error';
  /** Human-readable error message, present only when `status === "error"`. */
  error?: string;
};

// ─── Registry interface ───────────────────────────────────────────────────────

/**
 * Central plugin registry.
 * Manages plugin registration, dependency resolution, and teardown.
 *
 * Create an instance with `createPluginRegistry()`.
 * This type is never implemented by consumers — it is the interface they program against.
 */
export type PluginRegistry = {
  /**
   * Register a plugin.
   *
   * Validates conflicts and dependencies, then calls `plugin.setup`.
   * If any check fails, the plugin is not registered and an error Result is returned.
   * No partial state is left behind on failure.
   *
   * @param plugin - The plugin to register.
   * @returns `Result<PluginRegistration<API>>` — success with the registration record, or failure with an error code.
   *
   * Error codes:
   * - `"already-registered"` — a plugin with this ID is already registered.
   * - `"conflict"` — a conflicting plugin is already registered.
   * - `"missing-dependency"` — a required dependency is not registered.
   * - `"version-mismatch"` — a dependency's version does not satisfy the requirement.
   * - `"circular-dependency"` — the dependency graph contains a cycle.
   * - `"setup-error"` — `plugin.setup` threw an error.
   */
  register<API extends Record<string, unknown>>(
    plugin: Plugin<API>,
  ): Result<PluginRegistration<API>>;

  /**
   * Unregister a plugin by ID.
   *
   * Calls `plugin.teardown()` if defined (teardown errors are silently ignored).
   * Fails if any other active plugin declares a required dependency on this plugin.
   *
   * @param id - The plugin ID to unregister.
   * @returns `Result<void>` — success, or failure with an error code.
   *
   * Error codes:
   * - `"not-found"` — no plugin with this ID is registered.
   * - `"dependency-active"` — at least one other active plugin depends on this one.
   */
  unregister(id: PluginId): Result<void>;

  /**
   * Retrieve the resolved API of a registered plugin.
   *
   * The return type uses an unchecked cast — the caller is responsible for
   * supplying the correct API type parameter.
   *
   * @param id - The plugin ID to look up.
   * @returns The plugin's API object, or `null` if the plugin is not registered.
   */
  getApi<API extends Record<string, unknown>>(id: PluginId): API | null;

  /**
   * Returns `true` if a plugin with the given ID is currently registered.
   *
   * @param id - The plugin ID to check.
   */
  has(id: PluginId): boolean;

  /**
   * Returns all active plugin registrations in insertion order.
   */
  list(): PluginRegistration[];

  /**
   * Unregisters all plugins (in reverse registration order) and resets the registry to empty.
   * Calls `teardown` on each plugin; teardown errors are silently ignored.
   */
  reset(): void;
};

// ─── Debug snapshot ───────────────────────────────────────────────────────────

/**
 * A plain-object snapshot of the registry state, suitable for logging and debugging.
 * Produced by the `debugRegistry` free function.
 */
export type RegistrySnapshot = {
  /** Snapshot of each registered plugin. */
  plugins: Array<{
    /** Plugin identifier. */
    id: PluginId;
    /** Plugin display name. */
    name: string;
    /** Plugin version string. */
    version: PluginVersion;
    /** Whether the plugin is active or in error state. */
    status: 'active' | 'error';
    /** IDs of all declared dependencies (required and optional). */
    dependencies: PluginId[];
    /** Error message if `status === "error"`. */
    error?: string;
  }>;
  /**
   * Plugin IDs in the order they were registered.
   * This is the dependency-safe order: if B depends on A, A appears before B.
   */
  dependencyOrder: PluginId[];
};
