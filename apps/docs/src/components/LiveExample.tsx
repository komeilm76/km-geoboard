import { Sandpack } from '@codesandbox/sandpack-react';

interface LiveExampleProps {
  code: string;
  title?: string;
}

/**
 * Renders an in-browser live code example.
 *
 * Architecture:
 *  - /example.js  — shown in the editor (clean npm-style code, read-only)
 *  - /index.html  — hidden, actually runs in the iframe preview
 *
 * Packages are loaded via esm.sh CDN directly in the browser (type="module"),
 * bypassing Sandpack's bundler which cannot resolve our ESM/CJS namespace exports.
 * console.log() is replaced with a helper that writes to a <pre> element.
 */
export function LiveExample({ code, title }: LiveExampleProps) {
  // Strip import lines — packages are injected by the HTML runner instead.
  const runnable = code
    .split('\n')
    .filter(line => !line.trimStart().startsWith('import '))
    .join('\n')
    .trim()
    .replace(/console\.log\(/g, '_log(');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; background:#111827; color:#e2e8f0;
           font:13px/1.6 "Fira Code",ui-monospace,monospace; padding:1rem; }
    pre  { margin:0; white-space:pre-wrap; word-break:break-word; }
    .err { color:#f87171; }
  </style>
</head>
<body>
<pre id="out">⏳ Loading packages from CDN…</pre>
<script type="module">
// km-geoboard loaded straight from esm.sh — no local bundler needed
import * as _G from 'https://esm.sh/@komeilm76/km-geoboard?bundle&target=es2022';
const artboard = _G.artboard;
const svg      = _G.svg;
const map      = _G.map;
const imports  = _G.imports;
const plugins  = _G.plugins;
// 'exports' is special in CJS but perfectly valid as a const in ESM modules
const exports  = _G['exports'];
const ex       = _G['exports']; // alias used in import-export examples

const _el    = document.getElementById('out');
const _lines = [];
function _log(...a) {
  _lines.push(a.map(x => x !== null && typeof x === 'object'
    ? JSON.stringify(x) : String(x)).join(' '));
  _el.textContent = _lines.join('\\n');
}

_el.textContent = '';
try {
${runnable}
} catch (e) {
  _el.innerHTML = '<span class="err">Error: ' + e.message + '</span>';
}
</script>
</body>
</html>`;

  return (
    <div className="sandpack-wrapper">
      {title && (
        <p style={{
          margin: '0', padding: '0.5rem 1rem',
          background: 'var(--sl-color-bg-nav)',
          fontWeight: 600, fontSize: '0.85rem',
          color: 'var(--sl-color-text-accent)',
        }}>
          {title}
        </p>
      )}
      <Sandpack
        theme="auto"
        template="vanilla"
        files={{
          '/index.html': { code: html, hidden: true },
          '/example.js': { code,        active: true, readOnly: true },
        }}
        options={{
          showLineNumbers: true,
          editorHeight: 420,
          autorun: true,
        }}
      />
    </div>
  );
}
