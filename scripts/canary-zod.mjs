#!/usr/bin/env node
/**
 * canary-zod.mjs — R-1 mitigation (see .planning/risks.md).
 *
 * The structural types in km-shared/src/zodStructural.ts depend on Zod's
 * `_zod` internals staying shape-compatible. This canary compiles the
 * structural types + a downstream schemas.ts against zod@latest (NOT the
 * pinned workspace version) so a breaking Zod minor is detected the day it
 * ships, not the day a consumer upgrades.
 *
 * Non-blocking in CI (continue-on-error) — a red canary is a warning, not a
 * broken build.
 *
 * Usage: node scripts/canary-zod.mjs [zod-version]   (default: latest)
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const zodVersion = process.argv[2] ?? 'latest';
const work = mkdtempSync(join(tmpdir(), 'canary-zod-'));

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const posix = (p) => p.split('\\').join('/');

try {
  console.log(`[canary-zod] workdir: ${work}`);
  writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'canary-zod', private: true }, null, 2));

  console.log(`[canary-zod] installing zod@${zodVersion} + typescript@latest …`);
  run(`npm install --no-audit --no-fund --silent zod@${zodVersion} typescript@latest`, work);

  const installed = JSON.parse(
    execSync('node -p "JSON.stringify(require(\'zod/package.json\').version)"', { cwd: work, encoding: 'utf8' }),
  );
  console.log(`[canary-zod] zod resolved to ${installed}`);

  // Compile the structural-type sources against the freshly installed zod.
  // `paths` forces BOTH the structural types and the downstream schema file
  // to see zod@latest instead of the workspace-pinned version.
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      paths: {
        zod: [posix(join(work, 'node_modules', 'zod', 'index.d.ts'))],
        '@komeilm76/km-shared': [posix(join(repoRoot, 'packages', 'km-shared', 'src', 'index.ts'))],
      },
    },
    include: [
      // The structural types themselves
      posix(join(repoRoot, 'packages', 'km-shared', 'src', 'zodStructural.ts')),
      // Factories returning $SchemaOf<T> (exercise the cast pattern)
      posix(join(repoRoot, 'packages', 'km-shared', 'src', 'zodUtils.ts')),
      // A downstream schemas.ts using SchemaOf + cast-back-for-chaining
      posix(join(repoRoot, 'packages', 'km-geojson', 'src', 'schemas.ts')),
    ],
  };
  writeFileSync(join(work, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  console.log('[canary-zod] tsc --noEmit …');
  run('npx tsc -p tsconfig.json', work);

  console.log(`[canary-zod] PASS — structural types compile against zod@${installed}`);
} catch (err) {
  console.error(`[canary-zod] FAIL — zod@${zodVersion} breaks the structural types (R-1 fired).`);
  console.error('[canary-zod] Action: inspect zod release notes; adjust km-shared/src/zodStructural.ts; consider tightening the peer range.');
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
