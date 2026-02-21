/**
 * Deterministic warm color palette for projects.
 * Given a project ID, always returns the same warm HSL color.
 * If the project has a custom color set, that takes priority.
 */

import type { Project } from './storage/types';

const WARM_COLORS = [
  { bg: '0 72% 51%', fg: '0 0% 100%' },       // red
  { bg: '20 90% 48%', fg: '0 0% 100%' },       // orange-red
  { bg: '30 95% 50%', fg: '0 0% 10%' },        // orange
  { bg: '40 96% 50%', fg: '0 0% 10%' },        // amber
  { bg: '45 93% 47%', fg: '0 0% 10%' },        // yellow
  { bg: '350 80% 55%', fg: '0 0% 100%' },      // rose
  { bg: '15 85% 55%', fg: '0 0% 100%' },       // coral
  { bg: '10 78% 54%', fg: '0 0% 100%' },       // tomato
  { bg: '25 95% 53%', fg: '0 0% 10%' },        // tangerine
  { bg: '338 70% 50%', fg: '0 0% 100%' },      // pink
];

/** All preset colors for the color picker UI */
export const PRESET_COLORS = WARM_COLORS;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProjectColor(projectIdOrProject: string | Project) {
  if (typeof projectIdOrProject === 'object' && projectIdOrProject.color) {
    // Determine if custom color is light or dark for contrast
    const hsl = projectIdOrProject.color;
    const lightness = parseInt(hsl.split('%')[0]?.split(' ').pop() || '50');
    return { bg: hsl, fg: lightness > 55 ? '0 0% 10%' : '0 0% 100%' };
  }
  const id = typeof projectIdOrProject === 'string' ? projectIdOrProject : projectIdOrProject.id;
  const idx = hashCode(id) % WARM_COLORS.length;
  return WARM_COLORS[idx];
}

/**
 * Determine appropriate foreground color for a given HSL background.
 */
export function getFgForHsl(hslStr: string): string {
  // Parse lightness from "H S% L%"
  const parts = hslStr.trim().split(/\s+/);
  const lightness = parseFloat(parts[2]?.replace('%', '') || '50');
  return lightness > 55 ? '0 0% 10%' : '0 0% 100%';
}
