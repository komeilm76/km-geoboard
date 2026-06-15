import type { geojson as Geo } from '@komeilm76/km-geoboard';

interface GeoJsonViewerProps {
  data: Geo.GeoJsonFeatureCollection | null;
}

export function GeoJsonViewer({ data }: GeoJsonViewerProps) {
  if (!data) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
        No data — import a file first
      </div>
    );
  }

  const pretty = JSON.stringify(data, null, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ margin: 0 }}>GeoJSON</h2>
        <span style={{ fontSize: 12, color: '#64748b' }}>{data.features.length} feature{data.features.length !== 1 ? 's' : ''}</span>
      </div>
      <pre style={{
        flex: 1,
        overflow: 'auto',
        margin: 0,
        padding: 8,
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 6,
        fontSize: 11,
        lineHeight: 1.5,
        color: '#94a3b8',
        whiteSpace: 'pre',
      }}>
        {pretty}
      </pre>
    </div>
  );
}
