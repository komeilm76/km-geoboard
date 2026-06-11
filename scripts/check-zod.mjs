/**
 * check-zod — fails if any declaration file in dist/ references the 'zod'
 * module. Runtime bundles (.js/.cjs) legitimately import zod (peerDependency);
 * declaration files must never (see zod_hang.md RULE 7).
 * Run from a package directory: node ../../scripts/check-zod.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const re = /(from|require\(|import\()\s*['"]zod['"]/;
const offenders = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    console.error(`check-zod: no dist/ directory — run build first`);
    process.exit(1);
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.d\.(ts|cts|mts)$/.test(e.name)) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        const t = line.trim();
        // skip comment lines — only real import/require statements count
        if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) return;
        if (re.test(line)) offenders.push(`${p}:${i + 1}: ${t}`);
      });
    }
  }
}

walk(dist);
if (offenders.length) {
  console.error('ZOD LEAK DETECTED in declaration files:');
  for (const o of offenders) console.error('  ' + o);
  process.exit(1);
}
console.log('OK: no Zod in declaration files');
