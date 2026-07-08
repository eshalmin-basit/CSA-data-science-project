"use client";

import { useState } from "react";
import ors from "@/data/odds_ratios.json";
import { COLORS } from "@/lib/utils";

type Term = "csa_exposure" | "household_adversity_score";

const TERMS: { id: Term; label: string; color: string; note: string }[] = [
  {
    id: "csa_exposure",
    label: "Sexual-violence exposure",
    color: COLORS.exposed,
    note: "OR for exposed vs unexposed, adjusted for age, grade, sex, race/ethnicity, and household adversity.",
  },
  {
    id: "household_adversity_score",
    label: "Household adversity",
    color: COLORS.adversity,
    note: "OR per one-point increase (0–3), adjusted for demographics and sexual-violence exposure.",
  },
];

// log-scale x axis from 0.8 to 4.5
const X_MIN = Math.log(0.8);
const X_MAX = Math.log(4.5);
const W = 560;
const ROW_H = 44;
const LABEL_W = 210;

function x(v: number) {
  return LABEL_W + ((Math.log(v) - X_MIN) / (X_MAX - X_MIN)) * (W - LABEL_W - 90);
}

export default function ForestPlot() {
  const [term, setTerm] = useState<Term>("csa_exposure");
  const active = TERMS.find((t) => t.id === term)!;
  const rows = ors
    .filter((r) => r.term === term)
    .sort((a, b) => b.odds_ratio - a.odds_ratio);
  const H = rows.length * ROW_H + 46;

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {TERMS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTerm(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              term === t.id
                ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
                : "text-muted ring-1 ring-line hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W + 44} ${H}`} className="min-w-[560px]" role="img"
          aria-label={`Forest plot of adjusted odds ratios for ${active.label}`}>
          {/* reference line at OR=1 */}
          <line x1={x(1)} y1={8} x2={x(1)} y2={H - 38} stroke={COLORS.muted} strokeDasharray="4 4" strokeOpacity={0.5} />
          <text x={x(1)} y={H - 22} fill={COLORS.muted} fontSize={10} textAnchor="middle">
            OR = 1 (no association)
          </text>
          {[1.5, 2, 3, 4].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={8} x2={x(v)} y2={H - 38} stroke={COLORS.grid} />
              <text x={x(v)} y={H - 22} fill={COLORS.muted} fontSize={10} textAnchor="middle">{v}</text>
            </g>
          ))}

          {rows.map((r, i) => {
            const cy = 24 + i * ROW_H;
            return (
              <g key={r.outcome}>
                <text x={0} y={cy + 4} fill="#cbd5e1" fontSize={12.5}>{r.label}</text>
                <line
                  x1={x(Math.max(r.ci_low, 0.8))} y1={cy}
                  x2={x(Math.min(r.ci_high, 4.5))} y2={cy}
                  stroke={active.color} strokeWidth={2} strokeOpacity={0.65}
                />
                <circle cx={x(r.odds_ratio)} cy={cy} r={5.5} fill={active.color} />
                <text
                  x={W - 82} y={cy + 4} fill={active.color} fontSize={12} fontWeight={600}
                >
                  {r.odds_ratio.toFixed(2)}
                </text>
                <text x={W - 36} y={cy + 4} fill={COLORS.muted} fontSize={10.5}>
                  ({r.ci_low.toFixed(2)}–{r.ci_high.toFixed(2)})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        {active.note} Survey-weighted logistic regression with cluster-robust standard
        errors on school clusters (PSU); log-scale axis; whiskers are 95% CIs. Every
        interval excludes 1.
      </p>
    </div>
  );
}
