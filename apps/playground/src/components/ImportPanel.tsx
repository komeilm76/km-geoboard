import { useRef, useState } from 'react';
import { imports } from '@komeilm76/km-geoboard';
import type { geojson as Geo } from '@komeilm76/km-geoboard';

interface ImportPanelProps {
  onImport: (fc: Geo.GeoJsonFeatureCollection, format: string) => void;
}

const SAMPLE_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [13.405, 52.52] },
      properties: { name: 'Berlin' },
    },
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[13.405, 52.52], [2.349, 48.864]] },
      properties: { route: 'Berlin → Paris' },
    },
  ],
}, null, 2);

export function ImportPanel({ onImport }: ImportPanelProps) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = (raw: string) => {
    if (!raw.trim()) return;
    const auto = imports.importAuto(raw);
    // geojson / wkt / openlayers all resolve to a GeoJSON FeatureCollection.
    if (auto.format === 'geojson' || auto.format === 'wkt' || auto.format === 'openlayers') {
      const result = auto.result;
      if (result.success) {
        setStatus({ ok: true, msg: `Imported as ${auto.format} — ${result.data.features.length} features` });
        onImport(result.data, auto.format);
      } else {
        setStatus({ ok: false, msg: result.error.message });
      }
    } else if (!auto.result.success) {
      setStatus({ ok: false, msg: auto.result.error.message });
    } else {
      setStatus({ ok: false, msg: `Detected ${auto.format} — the viewer only displays GeoJSON feature collections` });
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target?.result as string;
      setText(raw);
      run(raw);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2>Import</h2>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { setText(SAMPLE_GEOJSON); setStatus(null); }}>Load sample</button>
        <button onClick={() => fileRef.current?.click()}>Open file…</button>
        <input ref={fileRef} type="file" accept=".json,.geojson,.svg" style={{ display: 'none' }} onChange={onFile} />
      </div>
      <textarea
        rows={8}
        placeholder="Paste GeoJSON / SVG / WKT here…"
        value={text}
        onChange={e => { setText(e.target.value); setStatus(null); }}
      />
      <button onClick={() => run(text)} disabled={!text.trim()}>Import →</button>
      {status && (
        <div style={{ fontSize: 12, color: status.ok ? '#86efac' : '#f87171' }}>
          {status.ok ? '✓ ' : '✗ '}{status.msg}
        </div>
      )}
    </div>
  );
}
