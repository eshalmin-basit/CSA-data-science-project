"use client";

import { useMemo, useState } from "react";
import screening from "@/data/screening.json";

type TargetKey = keyof typeof screening;
const TARGET_KEYS = Object.keys(screening) as TargetKey[];

export default function ThresholdExplorer() {
  const [target, setTarget] = useState<TargetKey>(TARGET_KEYS[0]);
  const model = screening[target].models.xgboost_calibrated;
  const sweep = model.threshold_sweep;
  const [idx, setIdx] = useState(() =>
    Math.max(0, sweep.findIndex((r) => r.threshold >= (model.operating_points.recall_80?.threshold ?? 0.3)))
  );
  const row = sweep[Math.min(idx, sweep.length - 1)];

  // school of 1,000 students
  const school = useMemo(() => {
    const n = row.tp + row.fp + row.fn + row.tn;
    const scale = 1000 / n;
    const tp = Math.round(row.tp * scale);
    const fp = Math.round(row.fp * scale);
    const fn = Math.round(row.fn * scale);
    const tn = 1000 - tp - fp - fn;
    return { tp, fp, fn, tn };
  }, [row]);

  const cells = useMemo(() => {
    const arr: ("tp" | "fp" | "fn" | "tn")[] = [];
    const per = 10; // each cell = 10 students
    const counts = {
      tp: Math.round(school.tp / per),
      fp: Math.round(school.fp / per),
      fn: Math.round(school.fn / per),
      tn: 0,
    };
    counts.tn = 100 - counts.tp - counts.fp - counts.fn;
    (["tp", "fp", "fn", "tn"] as const).forEach((k) => {
      for (let i = 0; i < counts[k]; i++) arr.push(k);
    });
    return arr;
  }, [school]);

  const CELL_COLOR = {
    tp: "#fb7185",
    fp: "#fbbf24",
    fn: "#7f1d2e",
    tn: "#1e293b",
  } as const;

  const setOperating = (which: "recall_90" | "recall_80") => {
    const op = model.operating_points[which];
    if (!op) return;
    const i = sweep.findIndex((r) => r.threshold === op.threshold);
    if (i >= 0) setIdx(i);
  };

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TARGET_KEYS.map((t) => (
            <button
              key={t}
              onClick={() => { setTarget(t); setIdx(20); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                target === t
                  ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
                  : "text-muted ring-1 ring-line hover:text-foreground"
              }`}
            >
              {screening[t].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOperating("recall_90")}
            className="rounded-full px-3 py-1.5 text-[0.7rem] font-medium text-good ring-1 ring-good/40 hover:bg-good/10">
            90% sensitivity
          </button>
          <button onClick={() => setOperating("recall_80")}
            className="rounded-full px-3 py-1.5 text-[0.7rem] font-medium text-good ring-1 ring-good/40 hover:bg-good/10">
            80% sensitivity
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>Alert threshold: flag students with risk ≥{" "}
          <span className="font-semibold text-foreground">{(row.threshold * 100).toFixed(0)}%</span>
        </span>
        <span>{(row.flagged_rate * 100).toFixed(0)}% of students flagged</span>
      </div>
      <input
        type="range"
        min={0}
        max={sweep.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full accent-[#fb7185]"
        aria-label="Alert threshold"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Sensitivity", value: `${(row.recall * 100).toFixed(0)}%`, sub: "of at-risk students caught", color: "text-good" },
            { label: "Precision", value: `${(row.precision * 100).toFixed(0)}%`, sub: "of alerts are true positives", color: "text-unexposed" },
            { label: "Specificity", value: `${(row.specificity * 100).toFixed(0)}%`, sub: "of not-at-risk left alone", color: "text-foreground" },
            { label: "Missed", value: `${school.fn}`, sub: "at-risk students missed per 1,000", color: "text-exposed" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-line bg-surface p-4">
              <div className={`text-2xl font-semibold ${m.color}`}>{m.value}</div>
              <div className="mt-1 text-[0.7rem] font-medium text-foreground">{m.label}</div>
              <div className="text-[0.65rem] text-muted">{m.sub}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            In a school of 1,000 students (each square = 10)
          </h3>
          <div className="grid grid-cols-20 gap-1" style={{ gridTemplateColumns: "repeat(20, minmax(0,1fr))" }}>
            {cells.map((k, i) => (
              <div
                key={i}
                className="aspect-square rounded-[3px] transition-colors duration-300"
                style={{ background: CELL_COLOR[k] }}
                title={k.toUpperCase()}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-muted">
            <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CELL_COLOR.tp }} />Flagged, at risk ({school.tp})</span>
            <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CELL_COLOR.fp }} />Flagged, not at risk ({school.fp})</span>
            <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CELL_COLOR.fn }} />Missed, at risk ({school.fn})</span>
            <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CELL_COLOR.tn }} />Not flagged, not at risk ({school.tn})</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Every number comes from the held-out test set of the calibrated XGBoost model.
        Because an alert here means <span className="text-foreground">a supportive conversation with a counselor</span>,
        not a punitive action, the tolerable false-positive load is high — which is why the
        sensitivity-first presets are the recommended operating points.
      </p>
    </div>
  );
}
