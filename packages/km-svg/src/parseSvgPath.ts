/**
 * parseSvgPath — SVG path `d` attribute string → SvgPathCommand[]
 *
 * Hand-written tokenizer that handles all absolute and relative commands,
 * and all SVG-spec number separators (space, comma, implicit via sign).
 */

import type { Result } from '@komeilm76/km-shared';
import type { SvgPathCommand } from './types';

// ─── Tokenizer ────────────────────────────────────────────────────────────────

const CMD_LETTERS = 'MmLlHhVvCcSsQqTtAaZz';

/** Split a path `d` string into [cmdLetter, ...numericTokens] segments. */
function tokenize(d: string): Array<{ cmd: string; args: number[] }> {
  const tokens: Array<{ cmd: string; args: number[] }> = [];
  // Match command letters and all numeric values (including negatives, scientific notation)
  const re = /([MmLlHhVvCcSsQqTtAaZz])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
  let currentCmd: string | null = null;
  let currentArgs: number[] = [];

  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) !== null) {
    if (m[1] !== undefined) {
      // command letter
      if (currentCmd !== null) {
        tokens.push({ cmd: currentCmd, args: currentArgs });
      }
      currentCmd = m[1]!;
      currentArgs = [];
    } else if (m[2] !== undefined) {
      currentArgs.push(parseFloat(m[2]!));
    }
  }
  if (currentCmd !== null) {
    tokens.push({ cmd: currentCmd, args: currentArgs });
  }
  return tokens;
}

// ─── Argument Counts ──────────────────────────────────────────────────────────

const ARG_COUNT: Record<string, number> = {
  M: 2, m: 2,
  L: 2, l: 2,
  H: 1, h: 1,
  V: 1, v: 1,
  C: 6, c: 6,
  S: 4, s: 4,
  Q: 4, q: 4,
  T: 2, t: 2,
  A: 7, a: 7,
  Z: 0, z: 0,
};

// ─── Command Builder ──────────────────────────────────────────────────────────

function buildCommands(cmd: string, args: number[]): SvgPathCommand[] {
  const count = ARG_COUNT[cmd] ?? 0;
  const cmds: SvgPathCommand[] = [];

  if (count === 0) {
    cmds.push({ cmd: cmd as 'Z' | 'z' });
    return cmds;
  }

  // Repeated implicit commands: M 10 10 20 20 → M + L (absolute) or m + l (relative)
  let implicitCmd = cmd;
  if (cmd === 'M') implicitCmd = 'L';
  if (cmd === 'm') implicitCmd = 'l';

  for (let i = 0; i + count <= args.length; i += count) {
    const a = args.slice(i, i + count);
    const c = i === 0 ? cmd : implicitCmd;

    switch (c) {
      case 'M': case 'm':
      case 'L': case 'l':
      case 'T': case 't':
        cmds.push({ cmd: c as SvgPathCommand['cmd'], x: a[0]!, y: a[1]! } as SvgPathCommand);
        break;
      case 'H': case 'h':
        cmds.push({ cmd: c as 'H' | 'h', x: a[0]! });
        break;
      case 'V': case 'v':
        cmds.push({ cmd: c as 'V' | 'v', y: a[0]! });
        break;
      case 'C': case 'c':
        cmds.push({ cmd: c as 'C' | 'c', x1: a[0]!, y1: a[1]!, x2: a[2]!, y2: a[3]!, x: a[4]!, y: a[5]! });
        break;
      case 'S': case 's':
        cmds.push({ cmd: c as 'S' | 's', x2: a[0]!, y2: a[1]!, x: a[2]!, y: a[3]! });
        break;
      case 'Q': case 'q':
        cmds.push({ cmd: c as 'Q' | 'q', x1: a[0]!, y1: a[1]!, x: a[2]!, y: a[3]! });
        break;
      case 'A': case 'a':
        cmds.push({
          cmd: c as 'A' | 'a',
          rx: a[0]!, ry: a[1]!, rotation: a[2]!,
          largeArc: (a[3] === 1 ? 1 : 0) as 0 | 1,
          sweep:    (a[4] === 1 ? 1 : 0) as 0 | 1,
          x: a[5]!, y: a[6]!,
        });
        break;
    }
  }
  return cmds;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse an SVG path `d` attribute string into an array of `SvgPathCommand` objects.
 */
export function parseSvgPath(d: string): Result<SvgPathCommand[]> {
  const trimmed = d.trim();
  if (trimmed === '') {
    return { success: true, data: [] };
  }

  // Must start with M or m
  if (!/^[Mm]/.test(trimmed)) {
    return {
      success: false,
      error: { code: 'invalid-input', message: 'SVG path must start with M or m command' },
    };
  }

  try {
    const segments = tokenize(trimmed);
    const commands: SvgPathCommand[] = [];
    for (const { cmd, args } of segments) {
      if (!(cmd in ARG_COUNT)) {
        return {
          success: false,
          error: { code: 'invalid-input', message: `Unknown path command: ${cmd}` },
        };
      }
      const built = buildCommands(cmd, args);
      commands.push(...built);
    }
    return { success: true, data: commands };
  } catch (err) {
    return {
      success: false,
      error: { code: 'invalid-input', message: err instanceof Error ? err.message : 'Failed to parse SVG path' },
    };
  }
}
