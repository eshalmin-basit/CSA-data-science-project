export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function fig(name: string): string {
  return `${BASE}/figures/${name}`;
}

export const COLORS = {
  exposed: "#fb7185",
  unexposed: "#38bdf8",
  adversity: "#fbbf24",
  mediation: "#a78bfa",
  good: "#34d399",
  muted: "#8fa0b8",
  grid: "rgba(148,163,184,0.12)",
};

export const TOOLTIP_STYLE = {
  backgroundColor: "#111a2c",
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: "0.6rem",
  color: "#e2e8f0",
  fontSize: "0.8rem",
};
