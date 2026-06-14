import { Sandpack } from '@codesandbox/sandpack-react';

interface LiveExampleProps {
  code: string;
  dependencies?: Record<string, string>;
  title?: string;
}

/**
 * Renders an in-browser live code example via Sandpack (CodeSandbox runtime).
 * Published npm packages are loaded directly — no local bundling needed.
 */
export function LiveExample({ code, dependencies = {}, title }: LiveExampleProps) {
  const defaultDeps: Record<string, string> = {
    '@komeilm76/km-geoboard': 'latest',
    'zod': 'latest',
    ...dependencies,
  };

  const pkgJson = JSON.stringify(
    { name: 'live-example', version: '1.0.0', type: 'module',
      scripts: { start: 'node index.js' },
      dependencies: defaultDeps },
    null, 2
  );

  return (
    <div className="sandpack-wrapper">
      {title && (
        <p style={{ margin: '0', padding: '0.5rem 1rem', background: 'var(--sl-color-bg-nav)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--sl-color-text-accent)' }}>
          {title}
        </p>
      )}
      <Sandpack
        theme="auto"
        template="node"
        files={{
          '/index.js': { code, active: true },
          '/package.json': { code: pkgJson, hidden: true },
        }}
        options={{
          showLineNumbers: true,
          showInlineErrors: true,
          editorHeight: 380,
          autorun: true,
        }}
      />
    </div>
  );
}
