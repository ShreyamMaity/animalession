export const WORKSPACE_COLORS = {
  background: "#050510",
  accent: "#8b5cf6",
  accentLight: "#a78bfa",
  accentDark: "#7c3aed",
  nodeDefault: "#8b5cf6",
  edgeDefault: "#6366f1",
  grid: "#1a1a2e",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
} as const;

export const NODE_COLORS = [
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#f97316", // orange
  "#84cc16", // lime
] as const;

export const PROJECT_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
] as const;

export function getSpiralPosition(index: number): [number, number, number] {
  const spacing = 3;
  const angle = index * 0.8;
  const radius = spacing + index * 0.5;
  return [
    Math.cos(angle) * radius * 100,
    Math.sin(angle) * radius * 100,
    0,
  ];
}
