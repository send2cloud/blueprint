/**
 * Deterministic warm color palette for projects.
 * Given a project ID, always returns the same warm HSL color.
 */

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

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProjectColor(projectId: string) {
  const idx = hashCode(projectId) % WARM_COLORS.length;
  return WARM_COLORS[idx];
}
