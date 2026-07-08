"use client";

import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import dose from "@/data/dose_response.json";
import { COLORS, TOOLTIP_STYLE } from "@/lib/utils";

const SERIES: { key: string; label: string; color: string }[] = [
  { key: "persistent_sad_hopeless", label: "Persistent sadness", color: COLORS.mediation },
  { key: "vape_current", label: "Vaping (30d)", color: COLORS.exposed },
  { key: "any_illicit_ever", label: "Any illicit drug (ever)", color: COLORS.adversity },
  { key: "attempted_suicide_12mo", label: "Attempted suicide (12mo)", color: "#f87171" },
  { key: "binge_drinking_current", label: "Binge drinking (30d)", color: COLORS.unexposed },
  { key: "low_school_connectedness", label: "Low school connectedness", color: COLORS.good },
];

const data = dose.map((d) => ({ score: d.score, n: d.n, ...d.outcomes }));

export default function DoseResponse() {
  return (
    <div className="card p-5 md:p-8">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="score"
            tick={{ fill: COLORS.muted, fontSize: 12 }}
            label={{
              value: "Household adversity score (0–3)",
              position: "insideBottom",
              offset: -2,
              fill: COLORS.muted,
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            unit="%"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`]}
            labelFormatter={(s) => `Adversity score ${s}`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Weighted prevalence at each level of the household adversity score (count of:
        parent/guardian substance problem, severe mental illness, incarceration). Every
        outcome rises monotonically — the classic ACE dose–response pattern, reproduced
        in the 2023 national adolescent sample.
      </p>
    </div>
  );
}
