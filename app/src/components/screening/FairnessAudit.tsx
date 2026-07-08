"use client";

import { useState } from "react";
import screening from "@/data/screening.json";

type TargetKey = keyof typeof screening;
const TARGET_KEYS = Object.keys(screening) as TargetKey[];

export default function FairnessAudit() {
  const [target, setTarget] = useState<TargetKey>(TARGET_KEYS[0]);
  const rows = screening[target].fairness;

  const bar = (v: number | null, color: string) => (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${(v ?? 0) * 100}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-xs text-foreground">{v == null ? "—" : `${(v * 100).toFixed(0)}%`}</span>
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[0.68rem] uppercase tracking-wider text-muted">
              <th className="pb-3 pr-4 font-medium">Group</th>
              <th className="pb-3 pr-4 font-medium">n (test)</th>
              <th className="pb-3 pr-4 font-medium">AUC</th>
              <th className="pb-3 pr-4 font-medium">Sensitivity @ operating point</th>
              <th className="pb-3 font-medium">False-positive rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.group} className="border-b border-line/50">
                <td className="py-3 pr-4 text-foreground">{r.group}</td>
                <td className="py-3 pr-4 text-muted">{r.n.toLocaleString()}</td>
                <td className="py-3 pr-4 text-foreground">{r.auc.toFixed(2)}</td>
                <td className="py-3 pr-4">{bar(r.recall, "#34d399")}</td>
                <td className="py-3">{bar(r.fpr, "#fbbf24")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Race/ethnicity and sexual identity are <span className="text-foreground">deliberately
        excluded as model inputs</span> — a support-allocation tool must not condition on
        protected attributes. They are used here only to audit the deployed operating point
        (80% sensitivity, calibrated XGBoost, held-out test set). Groups with fewer than 150
        test students or 20 positive cases are not shown. Residual gaps between groups are
        reported, not hidden — closing them (e.g., group-specific thresholds and their legal
        trade-offs) is discussed in the paper.
      </p>
    </div>
  );
}
