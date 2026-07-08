"use client";

import { useState } from "react";
import mediation from "@/data/mediation.json";
import { COLORS } from "@/lib/utils";

const MEDIATORS = [
  { id: "persistent_sad_hopeless", label: "Persistent sadness / hopelessness" },
  { id: "poor_mental_health_30d", label: "Poor mental health (30d)" },
];

export default function MediationViz() {
  const [mediator, setMediator] = useState(MEDIATORS[0]);
  const rows = mediation
    .filter((r) => r.mediator === mediator.id)
    .sort((a, b) => b.prop_mediated_estimate - a.prop_mediated_estimate);

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-8 flex flex-wrap gap-2">
        {MEDIATORS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMediator(m)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              mediator.id === m.id
                ? "bg-mediation/15 text-foreground ring-1 ring-mediation/60"
                : "text-muted ring-1 ring-line hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* pathway diagram */}
      <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-0">
        <div className="rounded-xl border border-exposed/50 bg-exposed/10 px-5 py-3 text-center text-sm font-medium text-exposed">
          Sexual-violence
          <br /> exposure
        </div>
        <svg width="90" height="40" className="hidden sm:block" aria-hidden>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={COLORS.mediation} />
            </marker>
          </defs>
          <line x1="4" y1="20" x2="80" y2="20" stroke={COLORS.mediation} strokeWidth="2" markerEnd="url(#arr)" />
        </svg>
        <div className="rounded-xl border border-mediation/60 bg-mediation/10 px-5 py-3 text-center text-sm font-medium text-mediation">
          {mediator.label}
        </div>
        <svg width="90" height="40" className="hidden sm:block" aria-hidden>
          <line x1="4" y1="20" x2="80" y2="20" stroke={COLORS.mediation} strokeWidth="2" markerEnd="url(#arr)" />
        </svg>
        <div className="rounded-xl border border-adversity/50 bg-adversity/10 px-5 py-3 text-center text-sm font-medium text-adversity">
          Substance use /
          <br /> withdrawal
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.outcome} className="flex items-center gap-3">
            <span className="w-48 shrink-0 text-xs text-muted">{r.outcome_label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-sm bg-surface">
              <div
                className="flex h-full items-center rounded-sm pl-2 text-[0.65rem] font-semibold text-background"
                style={{
                  width: `${Math.min(r.prop_mediated_estimate * 100, 100)}%`,
                  background: COLORS.mediation,
                }}
              >
                {(r.prop_mediated_estimate * 100).toFixed(0)}%
              </div>
            </div>
            <span className="w-40 shrink-0 text-right text-[0.7rem] text-muted">
              ACME {r.acme_estimate.toFixed(3)} ({r.acme_ci_low.toFixed(3)}–{r.acme_ci_high.toFixed(3)})
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Bars show the proportion of the total exposure–outcome association carried through
        the mediator (Imai–Keele–Tingley causal mediation, probit models, 500 quasi-Bayesian
        draws, adjusted for demographics and household adversity). All indirect effects
        (ACME) are positive with 95% CIs excluding zero. Cross-sectional data: these are
        consistency checks for the coping hypothesis, not causal proof.
      </p>
    </div>
  );
}
