import { useState, type CSSProperties } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';

interface LiveExampleProps {
  code: string;
  /** Extra npm deps for the Sandpack (Live) runtime. */
  dependencies?: Record<string, string>;
  title?: string;
  /** Initial mode. Defaults to "static" so the page never contacts Sandpack
   *  servers until the reader explicitly opts in (useful where Sandpack is
   *  blocked / rate-limited). */
  defaultMode?: 'static' | 'live';
}

const PKG_URL = 'https://esm.sh/@komeilm76/km-geoboard';

/**
 * A code example with a Static / Live toggle.
 *
 *  • Static (default) — shows the source read-only and runs it in a tiny
 *    sandboxed <iframe> as a native ES module (the `@komeilm76/km-geoboard`
 *    import is rewritten to esm.sh, console output is captured). No Sandpack,
 *    no shell server — nothing heavy to load or crash.
 *
 *  • Live — the full Sandpack (CodeSandbox) editable runtime. Only mounts when
 *    the reader switches to it, so Sandpack's servers are never contacted
 *    unless asked for.
 */
export function LiveExample({ code, dependencies = {}, title, defaultMode = 'static' }: LiveExampleProps) {
  const [mode, setMode] = useState<'static' | 'live'>(defaultMode);

  // ---- Static runner (sandboxed iframe + esm.sh) ----
  const runnable = code
    .replace(/from\s+['"]@komeilm76\/km-geoboard['"]/g, `from '${PKG_URL}'`)
    .replace(/<\/script>/gi, '<\\/script>');

  const srcDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%}
  body{background:#0f172a;color:#e2e8f0;
    font:13px/1.6 ui-monospace,"Fira Code",SFMono-Regular,monospace;
    padding:.75rem 1rem;box-sizing:border-box}
  .line{white-space:pre-wrap;word-break:break-word}
  .err{color:#f87171}.dim{color:#64748b;font-style:italic}
</style></head><body>
<div id="out"><span class="dim">Running…</span></div>
<script type="module">
  const out=document.getElementById('out');let cleared=false;
  function write(t,c){if(!cleared){out.textContent='';cleared=true;}
    const d=document.createElement('div');d.className='line'+(c?' '+c:'');d.textContent=t;out.appendChild(d);}
  const fmt=(a)=>a.map((x)=>{if(x===null)return'null';if(x===undefined)return'undefined';
    if(typeof x==='object'){try{return JSON.stringify(x);}catch(_){return String(x);}}return String(x);}).join(' ');
  console.log=(...a)=>write(fmt(a));console.info=(...a)=>write(fmt(a));
  console.warn=(...a)=>write(fmt(a));console.error=(...a)=>write(fmt(a),'err');
  window.addEventListener('error',(e)=>write('Error: '+(e.message||e.error),'err'));
  window.addEventListener('unhandledrejection',(e)=>write('Error: '+(e.reason&&e.reason.message?e.reason.message:e.reason),'err'));
</script>
<script type="module">
${runnable}
</script>
</body></html>`;

  // ---- Live runner (Sandpack) ----
  const pkgJson = JSON.stringify(
    { name: 'live-example', version: '1.0.0', type: 'module',
      scripts: { start: 'node index.js' },
      dependencies: { '@komeilm76/km-geoboard': 'latest', zod: 'latest', ...dependencies } },
    null, 2,
  );

  const tabBtn = (active: boolean): CSSProperties => ({
    appearance: 'none', border: 'none', cursor: 'pointer',
    padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: 4,
    background: active ? 'var(--sl-color-text-accent)' : 'transparent',
    color: active ? 'var(--sl-color-black)' : 'var(--sl-color-gray-2)',
  });

  return (
    <div className="live-example" style={{ border: '1px solid var(--sl-color-gray-5)', borderRadius: 6, overflow: 'hidden', margin: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--sl-color-bg-nav)', borderBottom: '1px solid var(--sl-color-gray-5)' }}>
        {title && <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--sl-color-text-accent)', marginRight: 'auto' }}>{title}</span>}
        <div role="tablist" aria-label="Example mode" style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--sl-color-gray-6)', marginLeft: title ? 0 : 'auto' }}>
          <button role="tab" aria-selected={mode === 'static'} style={tabBtn(mode === 'static')} onClick={() => setMode('static')}>Static</button>
          <button role="tab" aria-selected={mode === 'live'} style={tabBtn(mode === 'live')} onClick={() => setMode('live')}>Live</button>
        </div>
      </div>

      {mode === 'static' ? (
        <>
          <pre style={{ margin: 0, padding: '0.75rem 1rem', maxHeight: 360, overflow: 'auto', fontSize: '0.8rem', borderBottom: '1px solid var(--sl-color-gray-5)' }}>
            <code>{code}</code>
          </pre>
          <iframe
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            title={title ?? 'Live example output'}
            style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
          />
        </>
      ) : (
        <Sandpack
          theme="auto"
          template="node"
          files={{
            '/index.js': { code, active: true },
            '/package.json': { code: pkgJson, hidden: true },
          }}
          options={{ showLineNumbers: true, showInlineErrors: true, editorHeight: 380, autorun: true }}
        />
      )}
    </div>
  );
}
