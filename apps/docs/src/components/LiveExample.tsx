import { SandpackProvider, SandpackCodeEditor } from '@codesandbox/sandpack-react';

interface LiveExampleProps {
  code: string;
  title?: string;
}

/**
 * Architecture:
 *
 *  SandpackProvider + SandpackCodeEditor
 *    — syntax-highlighted code display only, initMode="lazy" so the bundler
 *      never auto-starts (there is no SandpackPreview to trigger it).
 *      The template="vanilla" env is declared but all default files are
 *      overridden to empty strings, so even if the bundler fires it has
 *      nothing to run.
 *
 *  <iframe srcDoc>
 *    — runs the actual code in a real browser context (no Sandpack bundler).
 *      Loads @komeilm76/km-geoboard directly from esm.sh as a native ES module.
 *      Writes console.log output to a <pre> element inside the iframe.
 *      sandbox="allow-scripts" is sufficient; esm.sh uses CORS: *.
 */
const BUNDLE_URL =
  'https://esm.sh/@komeilm76/km-geoboard?bundle&target=es2022';

export function LiveExample({ code, title }: LiveExampleProps) {
  // Strip import statements — namespaces are provided by the iframe runner
  const runnable = code
    .split('\n')
    .filter(line => !line.trimStart().startsWith('import '))
    .join('\n')
    .trim()
    .replace(/console\.log\(/g, '_log(');

  const srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin:0; height:100%; }
    body {
      background:#0f172a; color:#e2e8f0;
      font:13px/1.6 ui-monospace,"Fira Code",monospace;
      padding:.75rem 1rem; box-sizing:border-box;
    }
    pre  { margin:0; white-space:pre-wrap; word-break:break-word; }
    .err { color:#f87171; }
    .dim { color:#64748b; font-style:italic; }
  </style>
</head>
<body>
<pre id="out"><span class="dim">Running…</span></pre>
<script type="module">
import * as _G from '${BUNDLE_URL}';
const artboard = _G.artboard;
const svg      = _G.svg;
const map      = _G.map;
const imports  = _G.imports;
const plugins  = _G.plugins;
// 'exports' is valid as a const name inside an ES module
const exports  = _G['exports'];
const ex       = _G['exports'];   // alias used in import-export examples

const _el    = document.getElementById('out');
const _lines = [];
function _log(...a) {
  _lines.push(
    a.map(x => (x !== null && typeof x === 'object')
      ? JSON.stringify(x) : String(x)).join(' ')
  );
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
    <div className="live-example-wrapper">
      {title && (
        <p className="live-example-title">{title}</p>
      )}
      {/*
        template="vanilla" gives a proper JS environment in case the bundler
        ever starts, but all three default files are overridden to empty so
        there is nothing to execute. initMode="lazy" + no SandpackPreview
        means the bundler never actually starts.
      */}
      <SandpackProvider
        template="vanilla"
        files={{
          '/example.js': { code,  active: true, readOnly: true },
          '/index.html': { code: '', hidden: true },
          '/index.js':   { code: '', hidden: true },
          '/styles.css': { code: '', hidden: true },
        }}
        theme="auto"
        initMode="lazy"
      >
        <SandpackCodeEditor
          showLineNumbers
          showInlineErrors={false}
          readOnly
          style={{ height: 380, overflow: 'auto' }}
        />
      </SandpackProvider>
      {/* Execution: native browser ES module, no Sandpack bundler involved */}
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        title={title ?? 'Live example output'}
        style={{
          width: '100%',
          height: '220px',
          border: 'none',
          display: 'block',
          borderRadius: '0 0 4px 4px',
        }}
      />
    </div>
  );
}
