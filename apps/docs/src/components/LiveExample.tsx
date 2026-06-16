interface LiveExampleProps {
  code: string;
  title?: string;
}

/**
 * Minimal live example.
 *
 * Shows the source, then runs it inside a sandboxed <iframe> as a native ES
 * module. The bare `@komeilm76/km-geoboard` import is rewritten to esm.sh, and
 * console output is captured into the iframe's own DOM.
 *
 * No bundler, no dev-server, no WebContainer/shell — there is nothing that can
 * crash. Works as a plain static iframe in any browser.
 */
const PKG_URL = 'https://esm.sh/@komeilm76/km-geoboard';

export function LiveExample({ code, title }: LiveExampleProps) {
  // Rewrite the package import to a CDN URL so the iframe can load it directly,
  // and neutralise any stray closing-script token in the example source.
  const runnable = code
    .replace(/from\s+['"]@komeilm76\/km-geoboard['"]/g, `from '${PKG_URL}'`)
    .replace(/<\/script>/gi, '<\\/script>');

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html,body{margin:0;height:100%}
  body{background:#0f172a;color:#e2e8f0;
    font:13px/1.6 ui-monospace,"Fira Code",SFMono-Regular,monospace;
    padding:.75rem 1rem;box-sizing:border-box}
  .line{white-space:pre-wrap;word-break:break-word}
  .err{color:#f87171}
  .dim{color:#64748b;font-style:italic}
</style>
</head>
<body>
<div id="out"><span class="dim">Running…</span></div>
<script type="module">
  const out = document.getElementById('out');
  let cleared = false;
  function write(text, cls) {
    if (!cleared) { out.textContent = ''; cleared = true; }
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    out.appendChild(div);
  }
  const fmt = (args) => args.map((x) => {
    if (x === null) return 'null';
    if (x === undefined) return 'undefined';
    if (typeof x === 'object') { try { return JSON.stringify(x); } catch (_) { return String(x); } }
    return String(x);
  }).join(' ');
  console.log = (...a) => write(fmt(a));
  console.info = (...a) => write(fmt(a));
  console.warn = (...a) => write(fmt(a));
  console.error = (...a) => write(fmt(a), 'err');
  window.addEventListener('error', (e) => write('Error: ' + (e.message || e.error), 'err'));
  window.addEventListener('unhandledrejection', (e) =>
    write('Error: ' + (e.reason && e.reason.message ? e.reason.message : e.reason), 'err'));
</script>
<script type="module">
${runnable}
</script>
</body>
</html>`;

  return (
    <div className="live-example" style={{ border: '1px solid var(--sl-color-gray-5)', borderRadius: 6, overflow: 'hidden', margin: '1rem 0' }}>
      {title && (
        <p style={{ margin: 0, padding: '0.5rem 1rem', background: 'var(--sl-color-bg-nav)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--sl-color-text-accent)' }}>
          {title}
        </p>
      )}
      <pre style={{ margin: 0, padding: '0.75rem 1rem', maxHeight: 360, overflow: 'auto', fontSize: '0.8rem', borderBottom: '1px solid var(--sl-color-gray-5)' }}>
        <code>{code}</code>
      </pre>
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        title={title ?? 'Live example output'}
        style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
      />
    </div>
  );
}
