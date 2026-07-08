"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import assoc from "@/data/exposure_assoc.json";
import { COLORS, TOOLTIP_STYLE } from "@/lib/utils";

type Group = "substance" | "mental_health" | "social";

const GROUPS: { id: Group; label: string }[] = [
  { id: "substance", label: "Substance use" },
  { id: "mental_health", label: "Mental health" },
  { id: "social", label: "Social connection" },
];

export default function FindingsChart() {
  const [group, setGroup] = useState<Group>("substance");

  const data = assoc
    .filter((r) => r.group === group)
    .sort((a, b) => b.exposed_pct - a.exposed_pct);

  const height = Math.max(300, data.length * 52);

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                group === g.id
                  ? "bg-exposed/15 text-exposed ring-1 ring-exposed/50"
                  : "text-muted ring-1 ring-line hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm bg-exposed" /> Exposed
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm bg-unexposed" /> Not exposed
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 56 }} barGap={2}>
          <CartesianGrid horizontal={false} stroke={COLORS.grid} />
          <XAxis
            type="number"
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            unit="%"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={210}
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "rgba(148,163,184,0.06)" }}
            formatter={(v) => [`${v}%`]}
          />
          <Bar dataKey="exposed_pct" name="Exposed" fill={COLORS.exposed} radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="prevalence_ratio"
              position="right"
              formatter={(v: React.ReactNode) => `${v}×`}
              style={{ fill: COLORS.exposed, fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
          <Bar dataKey="unexposed_pct" name="Not exposed" fill={COLORS.unexposed} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Weighted prevalence. Labels show the prevalence ratio (exposed ÷ unexposed).
        Exposure = any of: ever forced intercourse, sexual violence (12&nbsp;mo), sexual
        dating violence (12&nbsp;mo).
      </p>
    </div>
  );
}
