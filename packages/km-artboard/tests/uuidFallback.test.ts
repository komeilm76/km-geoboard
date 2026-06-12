/**
 * Node 18 has no global `crypto`; createArtboard must still generate valid
 * UUID v4 ids there (caught by the CI matrix on node-version 18).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createArtboard } from '../src/createArtboard';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const input = { startPoint: { x: 0, y: 0 }, endPoint: { x: 10, y: 10 } };

describe('createArtboard id generation without global crypto (Node 18)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to a valid UUID v4 when globalThis.crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    const r = createArtboard(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.artboard.id).toMatch(UUID_V4);
  });

  it('falls back when crypto exists but lacks randomUUID', () => {
    vi.stubGlobal('crypto', {});
    const r = createArtboard(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.artboard.id).toMatch(UUID_V4);
  });

  it('uses native crypto.randomUUID when available', () => {
    const r = createArtboard(input);
    expect(r.success).toBe(true);
    if (r.success) expect(r.artboard.id).toMatch(UUID_V4);
  });

  it('generates unique ids across calls in fallback mode', () => {
    vi.stubGlobal('crypto', undefined);
    const ids = new Set(
      Array.from({ length: 50 }, () => {
        const r = createArtboard(input);
        return r.success ? r.artboard.id : '';
      }),
    );
    expect(ids.size).toBe(50);
  });
});
