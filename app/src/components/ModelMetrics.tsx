"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import metrics from "@/data/model_metrics.json";
import { COLORS, TOOLTIP_STYLE } from "@/lib/utils";

const OUTCOME_ORDER = [
  "vape_current", "alcohol_current", "binge_drinking_current", "marijuana_current",
  "cig_current", "rx_pain_misuse_ever", "any_illicit_ever", "low_school_connectedness",
];

const shortLabel: Record<string, string> = {
  vape_current: "Vaping",
  alcohol_current: "Alcohol",
  binge_drinking_current: "Binge",
  marijuana_current: "Marijuana",
  cig_current: "Cigarettes",
  rx_pain_misuse_ever: "Rx misuse",
  any_illicit_ever: "Illicit any",
  low_school_connectedness: "Low connect.",
};

export default function ModelMetrics() {
  const [view, setView] = useState<"auc" | "recall">("recall");

  const data = OUTCOME_ORDER.map((o) => {
    const rows = metrics.filter((m) => m.outcome === o);
    const get = (model: string, imb: string) =>
      rows.find((r) => r.model === model && r.imbalance === imb);
    return {
      outcome: shortLabel[o],
      prevalence: rows[0]?.prevalence ?? 0,
      lr_cw: get("logistic", "class_weight"),
      xgb_cw: get("xgboost", "class_weight"),
      xgb_smote: get("xgboost", "smote"),
    };
  });

  const chartData: Record<string, string | number | undefined>[] =
    view === "recall"
      ? data.map((d) => ({
          outcome: d.outcome,
          "Class weights (XGBoost)": d.xgb_cw?.recall,
          "SMOTE (XGBoost)": d.xgb_smote?.recall,
        }))
      : data.map((d) => ({
          outcome: d.outcome,
          "Logistic ROC-AUC": d.lr_cw?.roc_auc,
          "XGBoost ROC-AUC": d.xgb_cw?.roc_auc,
        }));

  const colors =
    view === "recall"
      ? [COLORS.good, "#f87171"]
      : [COLORS.unexposed, COLORS.exposed];

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setView("recall")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            view === "recall"
              ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
              : "text-muted ring-1 ring-line hover:text-foreground"
          }`}
        >
          Recall: class weights vs SMOTE
        </button>
        <button
          onClick={() => setView("auc")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            view === "auc"
              ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
              : "text-muted ring-1 ring-line hover:text-foreground"
          }`}
        >
          ROC-AUC: logistic vs XGBoost
        </button>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="outcome" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, view === "recall" ? 1 : 0.85]} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {Object.keys(chartData[0]).filter((k) => k !== "outcome").map((k, i) => (
            <Bar key={k} dataKey={k} fill={colors[i]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        {view === "recall" ? (
          <>
            Sensitivity (recall) at threshold 0.5 under 5-fold stratified CV. SMOTE —
            applied only inside training folds — <span className="text-foreground">collapses recall</span> for
            XGBoost on these sparse binary survey features, while inverse-prevalence class
            weights preserve it. A practically important negative result for oversampling.
          </>
        ) : (
          <>
            Cross-validated ROC-AUC using only trauma-exposure, adversity, and demographic
            features (mediators deliberately excluded). Logistic regression matches XGBoost
            on most outcomes — the signal is predominantly additive.
          </>
        )}
      </p>
    </div>
  );
}
