import { useState } from 'react';
import { ArtboardCanvas } from './components/ArtboardCanvas';
import { ImportPanel } from './components/ImportPanel';
import { GeoJsonViewer } from './components/GeoJsonViewer';
import { ExportPanel } from './components/ExportPanel';
import type { geojson as Geo, artboard as Art } from '@komeilm76/km-geoboard';

type Tab = 'canvas' | 'import' | 'geojson';

export default function App() {
  const [boards, setBoards] = useState<Art.Artboard[]>([]);
  const [geojson, setGeojson] = useState<Geo.GeoJsonFeatureCollection | null>(null);
  const [tab, setTab] = useState<Tab>('canvas');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 16px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
          km-geoboard <span style={{ color: '#6366f1' }}>playground</span>
        </span>
        <nav style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
          {(['canvas', 'import', 'geojson'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? '#6366f1' : 'transparent',
                borderColor: tab === t ? '#6366f1' : '#334155',
                color: tab === t ? '#fff' : '#94a3b8',
                padding: '4px 12px',
                fontSize: 13,
              }}
            >{t === 'canvas' ? 'Artboard Canvas' : t === 'import' ? 'Import' : 'GeoJSON'}</button>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#475569' }}>
          {boards.length} board{boards.length !== 1 ? 's' : ''}
          {geojson ? ` · ${geojson.features.length} feature${geojson.features.length !== 1 ? 's' : ''}` : ''}
        </div>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: main view */}
        <main style={{ flex: 1, padding: 16, overflow: 'auto' }}>
          {tab === 'canvas' && (
            <div className="panel" style={{ height: '100%' }}>
              <ArtboardCanvas onArtboardsChange={setBoards} />
            </div>
          )}
          {tab === 'import' && (
            <div className="panel">
              <ImportPanel onImport={(fc, _fmt) => { setGeojson(fc); setTab('geojson'); }} />
            </div>
          )}
          {tab === 'geojson' && (
            <div className="panel" style={{ height: '100%' }}>
              <GeoJsonViewer data={geojson} />
            </div>
          )}
        </main>

        {/* Right sidebar: export */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          padding: 12,
          borderLeft: '1px solid #334155',
          overflowY: 'auto',
        }}>
          <div className="panel">
            <ExportPanel geojson={geojson} boards={boards} />
          </div>
        </aside>
      </div>
    </div>
  );
}
