"use client";

import { useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import screening from "@/data/screening.json";
import { COLORS, TOOLTIP_STYLE } from "@/lib/utils";

type TargetKey = keyof typeof screening;
const TARGET_KEYS = Object.keys(screening) as TargetKey[];

export default function DecisionCurvePanel() {
  const [target, setTarget] = useState<TargetKey>(TARGET_KEYS[0]);
  const data = screening[target].models.xgboost_calibrated.decision_curve.map((d) => ({
    threshold: d.threshold,
    "Screen by model": d.net_benefit_model,
    "Screen everyone": d.net_benefit_treat_all,
    "Screen no one": d.net_benefit_treat_none,
  }));

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {TARGET_KEYS.map((k) => (
          <button key={k} onClick={() => setTarget(k)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              target === k
                ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
                : "text-muted ring-1 ring-line hover:text-foreground"
            }`}>
            {screening[k].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="threshold" tick={{ fill: COLORS.muted, fontSize: 11 }}
            axisLine={false} tickLine={false}
            label={{ value: "Threshold probability (how selective outreach is)", position: "insideBottom", offset: -4, fill: COLORS.muted, fontSize: 11 }} />
          <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: "Net benefit", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="Screen by model" stroke={COLORS.exposed} strokeWidth={2.5} dot={false} />
          <Line dataKey="Screen everyone" stroke={COLORS.adversity} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
          <Line dataKey="Screen no one" stroke={COLORS.muted} strokeWidth={1.5} strokeDasharray="2 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Decision-curve analysis (Vickers &amp; Elkin): net benefit = true positives −
        false positives weighted by how costly an unnecessary outreach is at each
        threshold. The model curve sitting above both{" "}
        <span className="text-adversity">screen-everyone</span> and{" "}
        <span className="text-muted">screen-no-one</span> across the plausible threshold
        range means model-guided outreach beats both blanket programs and doing nothing —
        the whole practical case for the tool in one chart.
      </p>
    </div>
  );
}
