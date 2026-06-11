/**
 * serializeSvgPath — SvgPathCommand[] → SVG path `d` string
 *
 * Cannot fail — returns a plain string (no Result wrapper).
 * Round-trips correctly with parseSvgPath.
 */

import type { SvgPathCommand } from './types';

/**
 * Convert an array of `SvgPathCommand` objects back into an SVG path `d` string.
 * This function never throws — it always returns a string.
 */
export function serializeSvgPath(commands: SvgPathCommand[]): string {
  return commands.map(cmd => {
    switch (cmd.cmd) {
      case 'M': case 'm':
      case 'L': case 'l':
      case 'T': case 't':
        return `${cmd.cmd} ${cmd.x},${cmd.y}`;

      case 'H': case 'h':
        return `${cmd.cmd} ${cmd.x}`;

      case 'V': case 'v':
        return `${cmd.cmd} ${cmd.y}`;

      case 'C': case 'c':
        return `${cmd.cmd} ${cmd.x1},${cmd.y1} ${cmd.x2},${cmd.y2} ${cmd.x},${cmd.y}`;

      case 'S': case 's':
        return `${cmd.cmd} ${cmd.x2},${cmd.y2} ${cmd.x},${cmd.y}`;

      case 'Q': case 'q':
        return `${cmd.cmd} ${cmd.x1},${cmd.y1} ${cmd.x},${cmd.y}`;

      case 'A': case 'a':
        return `${cmd.cmd} ${cmd.rx},${cmd.ry} ${cmd.rotation} ${cmd.largeArc} ${cmd.sweep} ${cmd.x},${cmd.y}`;

      case 'Z': case 'z':
        return cmd.cmd;
    }
  }).join(' ');
}
