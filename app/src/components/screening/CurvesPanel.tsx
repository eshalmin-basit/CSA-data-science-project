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

function mergeCurves(
  a: { x: number; y: number }[],
  b: { x: number; y: number }[],
  aName: string,
  bName: string,
) {
  const rows: Record<string, number>[] = [];
  a.forEach((p) => rows.push({ x: p.x, [aName]: p.y } as never));
  b.forEach((p) => rows.push({ x: p.x, [bName]: p.y } as never));
  return rows.sort((r, s) => (r.x as number) - (s.x as number));
}

export default function CurvesPanel() {
  const [target, setTarget] = useState<TargetKey>(TARGET_KEYS[0]);
  const t = screening[target];
  const xgb = t.models.xgboost_calibrated;
  const lr = t.models.logistic;

  const roc = mergeCurves(xgb.roc_curve, lr.roc_curve, "XGBoost", "Logistic");
  const pr = mergeCurves(xgb.pr_curve, lr.pr_curve, "XGBoost", "Logistic");
  const cal = xgb.calibration.map((c) => ({
    x: c.mean_pred, observed: c.frac_pos, ideal: c.mean_pred,
  }));

  const panel = (
    title: string,
    data: Record<string, number>[],
    xLabel: string,
    yLabel: string,
    series: { key: string; color: string; dash?: string }[],
    footer: string,
  ) => (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-2 text-xs font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
          <CartesianGrid stroke={COLORS.grid} />
          <XAxis dataKey="x" type="number" domain={[0, 1]} tick={{ fill: COLORS.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
            label={{ value: xLabel, position: "insideBottom", offset: -2, fill: COLORS.muted, fontSize: 10 }} />
          <YAxis domain={[0, 1]} tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 24, fill: COLORS.muted, fontSize: 10 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} stroke={s.color} strokeWidth={2}
              strokeDasharray={s.dash} dot={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">{footer}</p>
    </div>
  );

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

      <div className="grid gap-4 lg:grid-cols-3">
        {panel(
          `ROC — AUC ${xgb.auc} (XGB) / ${lr.auc} (LR)`,
          roc, "False positive rate", "True positive rate",
          [{ key: "XGBoost", color: COLORS.exposed }, { key: "Logistic", color: COLORS.unexposed }],
          "Discrimination on the held-out test set. The two models are nearly tied — the risk signal is mostly additive.",
        )}
        {panel(
          `Precision–recall — PR-AUC ${xgb.pr_auc} (XGB)`,
          pr, "Recall (sensitivity)", "Precision",
          [{ key: "XGBoost", color: COLORS.exposed }, { key: "Logistic", color: COLORS.unexposed }],
          `Base rate ${(t.prevalence * 100).toFixed(0)}% (dashed floor). Precision stays above base rate across the sensitivity range used for screening.`,
        )}
        {panel(
          `Calibration — Brier ${xgb.brier}`,
          cal, "Predicted probability", "Observed frequency",
          [
            { key: "observed", color: COLORS.good },
            { key: "ideal", color: COLORS.muted, dash: "4 4" },
          ],
          "Platt-scaled probabilities vs observed frequency (quantile bins, test set). Points on the diagonal mean “20% risk” really is 20%.",
        )}
      </div>
    </div>
  );
}
