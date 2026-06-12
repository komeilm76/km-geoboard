#!/usr/bin/env node
/**
 * check-standards.mjs — R-2 mitigation (see .planning/risks.md).
 *
 * Enforces the normative decision table in .planning/PACKAGE_STANDARDS.md
 * against every package in packages/. Rule 9 of .planning/rules.md: a rule
 * without CI enforcement decays into documentation — this is the enforcement.
 *
 * Config-level checks only (no build artifacts needed, safe pre-build):
 *   package.json shape, exports map, files field, engines, publishConfig,
 *   repository.directory, scripts, zod placement, workspace protocol,
 *   tsconfig shape, required files, no-bun rule.
 *
 * Usage: node scripts/check-standards.mjs   (exit 1 on any violation)
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgsDir = join(repoRoot, 'packages');

const failures = [];
const fail = (pkg, msg) => failures.push(`  ${pkg}: ${msg}`);

const folders = readdirSync(pkgsDir).filter((f) => existsSync(join(pkgsDir, f, 'package.json')));

for (const folder of folders) {
  const dir = join(pkgsDir, folder);
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const id = folder;

  // ── Naming (§0): folder packages/km-<name> ↔ @komeilm76/km-<name> ──────────
  if (!folder.startsWith('km-')) fail(id, `folder must be named km-<name>, got "${folder}"`);
  if (pkg.name !== `@komeilm76/${folder}`) fail(id, `package name must be "@komeilm76/${folder}", got "${pkg.name}"`);

  // ── Entry points & exports map (§2) ────────────────────────────────────────
  if (pkg.type !== 'module') fail(id, `"type" must be "module"`);
  if (pkg.main !== './dist/index.cjs') fail(id, `"main" must be "./dist/index.cjs"`);
  if (pkg.module !== './dist/index.js') fail(id, `"module" must be "./dist/index.js"`);
  if (pkg.types !== './dist/index.d.ts') fail(id, `"types" must be "./dist/index.d.ts"`);
  const dot = pkg.exports?.['.'];
  if (!dot) fail(id, `exports["."] missing`);
  else {
    const want = {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
      default: './dist/index.js',
    };
    for (const [k, v] of Object.entries(want)) {
      if (dot[k] !== v) fail(id, `exports["."].${k} must be "${v}", got "${dot[k]}"`);
    }
    if (Object.keys(dot)[0] !== 'types') fail(id, `exports["."]: "types" must be the FIRST key (bundler requirement)`);
  }
  if (pkg.exports?.['./package.json'] !== './package.json') fail(id, `exports["./package.json"] must be "./package.json"`);

  // ── files / engines / publishConfig / repository (§2) ──────────────────────
  for (const f of ['dist', 'src', 'README.md', 'LICENSE']) {
    if (!pkg.files?.includes(f)) fail(id, `"files" must include "${f}"`);
  }
  if (pkg.engines?.node !== '>=18') fail(id, `engines.node must be ">=18"`);
  if (pkg.publishConfig?.access !== 'public') fail(id, `publishConfig.access must be "public"`);
  if (pkg.repository?.url !== 'git+https://github.com/komeilm76/km-geoboard.git') fail(id, `repository.url wrong`);
  if (pkg.repository?.directory !== `packages/${folder}`) fail(id, `repository.directory must be "packages/${folder}"`);
  if (pkg.license !== 'MIT') fail(id, `license must be "MIT"`);

  // ── Scripts (§2) — and the no-bun law ───────────────────────────────────────
  const wantScripts = {
    build: 'tsup',
    test: 'vitest run',
    'test:coverage': 'vitest run --coverage',
    lint: 'tsc --noEmit',
    'check-zod': 'node ../../scripts/check-zod.mjs',
  };
  for (const [k, v] of Object.entries(wantScripts)) {
    if (pkg.scripts?.[k] !== v) fail(id, `scripts.${k} must be "${v}", got "${pkg.scripts?.[k]}"`);
  }
  for (const [k, v] of Object.entries(pkg.scripts ?? {})) {
    if (/\bbun\b/i.test(v)) fail(id, `scripts.${k} references bun — forbidden (§0)`);
  }

  // ── Zod placement (zod_hang.md RULE 6) ──────────────────────────────────────
  // zod must be peer+dev in every package that USES it, and never a dependency.
  // Packages with zero zod imports (e.g. km-plugins) may omit it entirely.
  if (pkg.dependencies?.zod) fail(id, `zod must NEVER be in dependencies (zod_hang.md RULE 6)`);
  const srcDir = join(dir, 'src');
  const usesZod = existsSync(srcDir) && readdirSync(srcDir).some((f) =>
    f.endsWith('.ts') && /from ['"]zod['"]/.test(readFileSync(join(srcDir, f), 'utf8')),
  );
  const declaresZodViaDeps = Object.keys(pkg.dependencies ?? {})
    .filter((d) => d.startsWith('@komeilm76/')).length > 0;
  if (usesZod || (declaresZodViaDeps && pkg.peerDependencies?.zod !== undefined)) {
    if (pkg.peerDependencies?.zod !== '>=4.4.0') fail(id, `peerDependencies.zod must be ">=4.4.0" (package imports zod)`);
    if (!pkg.devDependencies?.zod) fail(id, `devDependencies.zod missing (needed for local tests)`);
  }
  if (!pkg.devDependencies?.['@vitest/coverage-v8']) fail(id, `devDependencies["@vitest/coverage-v8"] missing (coverage gate)`);

  // ── Workspace protocol ───────────────────────────────────────────────────────
  for (const [dep, ver] of Object.entries(pkg.dependencies ?? {})) {
    if (dep.startsWith('@komeilm76/') && ver !== 'workspace:*') {
      fail(id, `workspace sibling ${dep} must use "workspace:*", got "${ver}"`);
    }
  }

  // ── tsconfig shape (§3) ──────────────────────────────────────────────────────
  const tscPath = join(dir, 'tsconfig.json');
  if (!existsSync(tscPath)) fail(id, 'tsconfig.json missing');
  else {
    const tsc = JSON.parse(readFileSync(tscPath, 'utf8'));
    if (tsc.extends !== '../../tsconfig.base.json') fail(id, `tsconfig must extend ../../tsconfig.base.json`);
    if (tsc.compilerOptions?.noEmit !== true) fail(id, `tsconfig compilerOptions.noEmit must be true (§3)`);
    if (tsc.compilerOptions?.declaration !== false) fail(id, `tsconfig compilerOptions.declaration must be false (tsup owns dts)`);
    if (!tsc.include?.includes('src')) fail(id, `tsconfig include must contain "src"`);
  }

  // ── Required files (§1) ──────────────────────────────────────────────────────
  for (const f of ['src/index.ts', 'tsup.config.ts', 'vitest.config.ts', 'README.md', 'help.md', 'LICENSE', 'CHANGELOG.md']) {
    if (!existsSync(join(dir, f))) fail(id, `required file missing: ${f}`);
  }

  // ── Coverage thresholds present in vitest config (T-013 gate) ────────────────
  const vitestPath = join(dir, 'vitest.config.ts');
  if (existsSync(vitestPath) && !readFileSync(vitestPath, 'utf8').includes('thresholds')) {
    fail(id, `vitest.config.ts has no coverage thresholds (T-013 standard)`);
  }
}

if (failures.length > 0) {
  console.error(`check-standards: ${failures.length} violation(s) across ${folders.length} packages:\n`);
  console.error(failures.join('\n'));
  console.error('\nNormative reference: .planning/PACKAGE_STANDARDS.md (§ noted per finding)');
  process.exit(1);
}
console.log(`check-standards: ${folders.length} packages conform to PACKAGE_STANDARDS.md`);
