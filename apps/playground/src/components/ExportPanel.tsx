import { exports as ex } from '@komeilm76/km-geoboard';
import type { GeoJsonFeatureCollection, Artboard } from '@komeilm76/km-geoboard';

interface ExportPanelProps {
  geojson: GeoJsonFeatureCollection | null;
  boards: Artboard[];
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel({ geojson, boards }: ExportPanelProps) {
  const exportGeoJson = () => {
    if (!geojson) return;
    const result = ex.exportToGeoJson({ features: geojson.features, pretty: true });
    if (result.success) {
      download(result.data, 'export.geojson', 'application/geo+json');
    }
  };

  const exportArtboardMeta = () => {
    const meta = boards.map(b => ({
      id: b.id,
      name: b.name,
      x: b.position.x,
      y: b.position.y,
      width: b.size.width,
      height: b.size.height,
    }));
    download(JSON.stringify(meta, null, 2), 'artboards.json', 'application/json');
  };

  const exportSvg = () => {
    if (boards.length === 0) return;
    const maxX = Math.max(...boards.map(b => b.position.x + b.size.width));
    const maxY = Math.max(...boards.map(b => b.position.y + b.size.height));
    const rects = boards.map(b =>
      `  <rect x="${b.position.x}" y="${b.position.y}" width="${b.size.width}" height="${b.size.height}" fill="none" stroke="#6366f1" stroke-width="1" rx="2"/>\n` +
      `  <text x="${b.position.x + 6}" y="${b.position.y + 16}" font-size="11" fill="#6366f1">${b.name}</text>`
    ).join('\n');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxX + 20} ${maxY + 20}">\n${rects}\n</svg>`;
    download(svg, 'artboards.svg', 'image/svg+xml');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2>Export</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={exportGeoJson} disabled={!geojson || geojson.features.length === 0}>
          ↓ GeoJSON
          {geojson ? ` (${geojson.features.length} features)` : ''}
        </button>
        <button onClick={exportSvg} disabled={boards.length === 0}>
          ↓ SVG Artboards
          {boards.length > 0 ? ` (${boards.length} boards)` : ''}
        </button>
        <button onClick={exportArtboardMeta} disabled={boards.length === 0}>
          ↓ Artboard meta (JSON)
        </button>
      </div>
    </div>
  );
}
