import { useRef, useState, useCallback } from 'react';
import { artboard } from '@komeilm76/km-geoboard';
import type { Artboard } from '@komeilm76/km-geoboard';

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ArtboardCanvasProps {
  onArtboardsChange: (boards: Artboard[]) => void;
}

export function ArtboardCanvas({ onArtboardsChange }: ArtboardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [boards, setBoards] = useState<Artboard[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toSvgPoint = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== svgRef.current && (e.target as Element).tagName === 'rect') return;
    const p = toSvgPoint(e);
    setDrag({ startX: p.x, startY: p.y, currentX: p.x, currentY: p.y });
    setSelected(null);
    setError(null);
  }, [toSvgPoint]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag) return;
    const p = toSvgPoint(e);
    setDrag(d => d ? { ...d, currentX: p.x, currentY: p.y } : null);
  }, [drag, toSvgPoint]);

  const onMouseUp = useCallback(() => {
    if (!drag) return;
    const { startX, startY, currentX, currentY } = drag;
    const minDim = 20;
    if (Math.abs(currentX - startX) < minDim || Math.abs(currentY - startY) < minDim) {
      setDrag(null);
      return;
    }
    const result = artboard.createArtboard({
      startPoint: { x: Math.min(startX, currentX), y: Math.min(startY, currentY) },
      endPoint: { x: Math.max(startX, currentX), y: Math.max(startY, currentY) },
      name: `Board ${boards.length + 1}`,
    });
    if (result.success) {
      const next = [...boards, result.artboard];
      setBoards(next);
      onArtboardsChange(next);
    } else {
      setError(result.reason ?? 'Failed to create artboard');
    }
    setDrag(null);
  }, [drag, boards, onArtboardsChange]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    const next = boards.filter(b => b.id !== selected);
    setBoards(next);
    onArtboardsChange(next);
    setSelected(null);
  }, [selected, boards, onArtboardsChange]);

  const snapAll = useCallback(() => {
    const next = boards.map(b => artboard.snapArtboardToGrid({ artboard: b, gridSize: 50 }));
    setBoards(next);
    onArtboardsChange(next);
  }, [boards, onArtboardsChange]);

  const dragRect = drag ? {
    x: Math.min(drag.startX, drag.currentX),
    y: Math.min(drag.startY, drag.currentY),
    w: Math.abs(drag.currentX - drag.startX),
    h: Math.abs(drag.currentY - drag.startY),
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Artboard Canvas</h2>
        <span style={{ fontSize: 12, color: '#64748b' }}>click-drag to draw</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={snapAll} disabled={boards.length === 0}>Snap to Grid</button>
          <button onClick={deleteSelected} disabled={!selected} style={{ borderColor: '#ef4444', color: '#f87171' }}>Delete</button>
        </div>
      </div>
      {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
      <svg
        ref={svgRef}
        style={{ flex: 1, background: '#0f172a', borderRadius: 6, border: '1px solid #334155', cursor: 'crosshair', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {boards.map(b => (
          <g key={b.id} onClick={e => { e.stopPropagation(); setSelected(b.id); }}>
            <rect
              x={b.position.x} y={b.position.y}
              width={b.size.width} height={b.size.height}
              fill="rgba(99,102,241,0.1)"
              stroke={selected === b.id ? '#818cf8' : '#6366f1'}
              strokeWidth={selected === b.id ? 2 : 1}
              rx={2}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={b.position.x + 6} y={b.position.y + 16}
              fill="#a5b4fc" fontSize={11} style={{ pointerEvents: 'none' }}
            >{b.name}</text>
            <text
              x={b.position.x + 6} y={b.position.y + 28}
              fill="#64748b" fontSize={10} style={{ pointerEvents: 'none' }}
            >{b.size.width}×{b.size.height}</text>
          </g>
        ))}

        {dragRect && (
          <rect
            x={dragRect.x} y={dragRect.y}
            width={dragRect.w} height={dragRect.h}
            fill="rgba(99,102,241,0.08)"
            stroke="#6366f1"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
      </svg>
    </div>
  );
}
