# km-artboard

Pure artboard geometry for 2D canvas applications — create, resize, move, snap, and query rectangular regions. No DOM, no events, no mutations.

## Install

```bash
npm install km-artboard zod
```

## Quick start

```ts
import { createArtboard, moveArtboard, snapArtboardToGrid } from 'km-artboard';

// Create from two drag points
const result = createArtboard({
  startPoint: { x: 100, y: 80 },
  endPoint:   { x: 400, y: 320 },
  name: 'Frame 1',
});

if (result.success) {
  const { artboard } = result;

  // Move
  const moved = moveArtboard({ artboard, delta: { x: 50, y: 0 } });

  // Snap to 8px grid
  const snapped = snapArtboardToGrid({ artboard: moved, gridSize: 8 });
}
```

See [help.md](./help.md) for the full API reference.

## License

MIT — [komeilm76](https://github.com/komeilm76)
