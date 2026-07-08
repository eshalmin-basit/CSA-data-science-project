"use client";

import { useState } from "react";
import shapData from "@/data/shap_importance.json";
import { COLORS, fig } from "@/lib/utils";

const OUTCOMES: { id: keyof typeof shapData; label: string }[] = [
  { id: "vape_current", label: "Vaping" },
  { id: "alcohol_current", label: "Alcohol" },
  { id: "binge_drinking_current", label: "Binge drinking" },
  { id: "marijuana_current", label: "Marijuana" },
  { id: "cig_current", label: "Cigarettes" },
  { id: "rx_pain_misuse_ever", label: "Rx misuse" },
  { id: "any_illicit_ever", label: "Any illicit" },
  { id: "low_school_connectedness", label: "Low connectedness" },
];

const TRAUMA_FEATURES = new Set([
  "Sexual-violence exposure",
  "Household adversity (0-3)",
  "Physical dating violence",
  "Bullied at school",
  "Cyberbullied",
  "Witnessed community violence",
  "Unstable housing",
  "Basic needs met (protective)",
]);

export default function ShapExplorer() {
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number]>(OUTCOMES[0]);
  const rows = shapData[outcome.id].slice(0, 10);
  const max = rows[0]?.mean_abs_shap ?? 1;

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.id}
            onClick={() => setOutcome(o)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              outcome.id === o.id
                ? "bg-exposed/15 text-foreground ring-1 ring-exposed/50"
                : "text-muted ring-1 ring-line hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Mean |SHAP| — global feature importance
          </h3>
          <div className="space-y-2.5">
            {rows.map((r) => {
              const isTrauma = TRAUMA_FEATURES.has(r.feature);
              return (
                <div key={r.feature} className="flex items-center gap-3">
                  <span className="w-48 shrink-0 truncate text-xs text-muted" title={r.feature}>
                    {r.feature}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded-sm bg-surface">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${(r.mean_abs_shap / max) * 100}%`,
                        background: isTrauma ? COLORS.exposed : COLORS.muted,
                        opacity: isTrauma ? 1 : 0.55,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[0.7rem] text-muted">
                    {r.mean_abs_shap.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-exposed" /> Victimization / adversity
            </span>
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-muted opacity-60" /> Demographics
            </span>
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium text-foreground">
            SHAP beeswarm — direction &amp; spread per student
          </h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fig(`shap_summary_${outcome.id}.png`)}
            alt={`SHAP beeswarm for ${outcome.label}`}
            className="w-full rounded-lg bg-white p-1"
            loading="lazy"
          />
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        TreeSHAP on the final class-weighted XGBoost model (3,000-student sample).
        Victimization and adversity variables outrank every demographic feature on all
        substance outcomes.
      </p>
    </div>
  );
}
