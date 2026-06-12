#!/usr/bin/env node
/**
 * Consumer smoke test (T-012) — proves the *published artifacts* are usable
 * by a stranger: packs every public package, installs the tarballs into a
 * fresh fixture project (no workspace links), then verifies:
 *
 *   1. ESM import works (umbrella + every individual package)
 *   2. CJS require works
 *   3. Types check in a consumer tsconfig (`tsc --noEmit`), timed (< 5 s target)
 *   4. No Zod import reaches any packed `.d.ts` / `.d.cts` / `.d.mts`
 *
 * Prerequisite: `pnpm -r build` (dist/ must exist).
 * Usage: node scripts/smoke-consumer.mjs
 */
import { execSync } from 'node:child_process';
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgsDir = join(root, 'packages');
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8' });
const fail = (msg) => { console.error(`\n✗ SMOKE FAIL: ${msg}`); process.exit(1); };

// ---- 1. pack every public package --------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'km-smoke-'));
const names = readdirSync(pkgsDir).filter((d) => {
  try { return !JSON.parse(readFileSync(join(pkgsDir, d, 'package.json'), 'utf-8')).private; }
  catch { return false; }
});
console.log(`Packing ${names.length} packages → ${tmp}`);
const tarballs = [];
for (const d of names) {
  const out = run(`pnpm pack --pack-destination "${tmp}"`, join(pkgsDir, d)).trim().split('\n').pop().trim();
  tarballs.push(out);
}

// ---- 2. fresh fixture project (no workspace, no symlinks) ---------------
const fixture = join(tmp, 'fixture');
mkdirSync(fixture);
writeFileSync(join(fixture, 'package.json'), JSON.stringify({
  name: 'km-smoke-fixture', private: true, version: '0.0.0',
}, null, 2));
console.log('Installing tarballs + zod + typescript into fixture …');
run(
  `npm install --no-audit --no-fund --loglevel=error ${tarballs.map((t) => `"${t}"`).join(' ')} zod@^4.4.0 typescript@~5.9.2 @types/node@^22`,
  fixture,
);

// ---- 3. ESM import + behavior ------------------------------------------
writeFileSync(join(fixture, 'smoke.mjs'), `
import { shared, artboard, geojson, svg, map, imports, exports as exp, plugins } from '@komeilm76/km-geoboard';
import { createArtboard } from '@komeilm76/km-artboard';
import { parseGeoJson } from '@komeilm76/km-geojson';
import { parseSvgDocument } from '@komeilm76/km-svg';
import '@komeilm76/km-shared';
import '@komeilm76/km-map';
import '@komeilm76/km-imports';
import '@komeilm76/km-exports';
import '@komeilm76/km-plugins';

const a = artboard.createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 800, y: 600 }, name: 'Main' });
if (!a.success) throw new Error('createArtboard (umbrella) failed: ' + JSON.stringify(a));
const a2 = createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 10, y: 10 }, name: 'B' });
if (!a2.success) throw new Error('createArtboard (direct) failed');
const g = parseGeoJson({ type: 'Point', coordinates: [51.4, 35.7] });
if (!g.success) throw new Error('parseGeoJson failed: ' + JSON.stringify(g));
const s = parseSvgDocument('<svg viewBox="0 0 100 100"><rect x="1" y="1" width="10" height="10"/></svg>');
if (!s.success) throw new Error('parseSvgDocument failed: ' + JSON.stringify(s));
for (const [n, ns] of Object.entries({ shared, artboard, geojson, svg, map, imports, exp, plugins }))
  if (!ns || Object.keys(ns).length === 0) throw new Error('empty namespace: ' + n);
console.log('ESM OK');
`);
console.log(run('node smoke.mjs', fixture).trim());

// ---- 4. CJS require ------------------------------------------------------
writeFileSync(join(fixture, 'smoke.cjs'), `
const g = require('@komeilm76/km-geoboard');
const { createArtboard } = require('@komeilm76/km-artboard');
const a = g.artboard.createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 800, y: 600 }, name: 'Main' });
if (!a.success) throw new Error('CJS umbrella createArtboard failed');
if (!createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 5, y: 5 }, name: 'C' }).success)
  throw new Error('CJS direct createArtboard failed');
console.log('CJS OK');
`);
console.log(run('node smoke.cjs', fixture).trim());

// ---- 5. consumer type-check, timed ---------------------------------------
writeFileSync(join(fixture, 'smoke-types.ts'), `
import { artboard, geojson } from '@komeilm76/km-geoboard';
import type { GeoJsonFeatureCollection, GeoJsonGeometry } from '@komeilm76/km-geojson';
const r = artboard.createArtboard({ startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 }, name: 't' });
if (r.success) { const _w: number = r.artboard.size.width; void _w; }
const fc = geojson.parseGeoJsonFeatureCollection({});
const _t: GeoJsonFeatureCollection<GeoJsonGeometry | null, Record<string, unknown> | null> | undefined =
  fc.success ? fc.data : undefined;
void _t;
`);
writeFileSync(join(fixture, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    strict: true, noEmit: true, skipLibCheck: false,
    module: 'nodenext', moduleResolution: 'nodenext', target: 'es2022',
    types: ['node'],
  },
  include: ['smoke-types.ts'],
}, null, 2));
const t0 = Date.now();
run('npx tsc --noEmit', fixture);
const ms = Date.now() - t0;
console.log(`tsc --noEmit: ${ms} ms`);
if (ms > 10_000) fail(`consumer type-check took ${ms} ms (> 10 s hard limit)`);
if (ms > 5_000) console.warn(`⚠ tsc took ${ms} ms — above the 5 s target (success metric)`);

// ---- 6. Zod must not reach packed declaration files ----------------------
const offenders = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.d\.(ts|cts|mts)$/.test(e)) {
      // Same rule as scripts/check-zod.mjs: comment lines don't count.
      for (const line of readFileSync(p, 'utf-8').split('\n')) {
        const t = line.trim();
        if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) continue;
        if (/(from|require\(|import\()\s*['"]zod['"]/.test(line)) { offenders.push(p); break; }
      }
    }
  }
};
walk(join(fixture, 'node_modules', '@komeilm76'));
if (offenders.length) fail(`Zod leaked into packed declarations:\n  ${offenders.join('\n  ')}`);
console.log('No Zod in packed .d.ts ✓');

rmSync(tmp, { recursive: true, force: true });
console.log(`\n✓ SMOKE PASS — ${names.length} packages usable from tarballs (ESM, CJS, types, no Zod leak)`);
