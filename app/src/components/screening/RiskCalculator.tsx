"use client";

import { useMemo, useState } from "react";
import screening from "@/data/screening.json";

type TargetKey = keyof typeof screening;

const TARGET_KEYS = Object.keys(screening) as TargetKey[];

const BINARY_ORDER = [
  "csa_exposure",
  "physical_dating_violence_12mo",
  "bullied_at_school_12mo",
  "bullied_electronic_12mo",
  "witnessed_community_violence",
  "unstable_housing",
  "parent_substance_problem",
  "parent_mental_illness",
  "parent_incarcerated",
  "basic_needs_met",
  "female",
];

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export default function RiskCalculator() {
  const [target, setTarget] = useState<TargetKey>(TARGET_KEYS[0]);
  const [flags, setFlags] = useState<Record<string, boolean>>({
    basic_needs_met: true,
  });
  const [age, setAge] = useState(16);
  const [grade, setGrade] = useState(10);

  const calc = screening[target].calculator;

  const risk = useMemo(() => {
    let z = calc.intercept;
    const coefs = calc.coefficients as Record<string, number>;
    for (const f of BINARY_ORDER) z += (flags[f] ? 1 : 0) * (coefs[f] ?? 0);
    z += age * coefs.age + grade * coefs.grade;
    return sigmoid(z);
  }, [calc, flags, age, grade]);

  const base = calc.base_rate;
  const rel = risk / base;
  const pct = Math.round(risk * 100);
  const meta = calc.feature_meta as Record<string, { label: string; kind: string }>;

  return (
    <div className="card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {TARGET_KEYS.map((t) => (
          <button
            key={t}
            onClick={() => setTarget(t)}
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

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="mb-4 text-sm font-medium text-foreground">Screening intake</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {BINARY_ORDER.filter((f) => f !== "female").map((f) => (
              <button
                key={f}
                onClick={() => setFlags((s) => ({ ...s, [f]: !s[f] }))}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs transition-colors ${
                  flags[f]
                    ? f === "basic_needs_met"
                      ? "border-good/60 bg-good/10 text-foreground"
                      : "border-exposed/60 bg-exposed/10 text-foreground"
                    : "border-line text-muted hover:text-foreground"
                }`}
              >
                <span>{meta[f]?.label ?? f}</span>
                <span
                  className={`ml-2 inline-block h-4 w-7 shrink-0 rounded-full transition-colors ${
                    flags[f]
                      ? f === "basic_needs_met" ? "bg-good" : "bg-exposed"
                      : "bg-surface-2 ring-1 ring-line"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      flags[f] ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-xs text-muted">
            <label className="flex items-center gap-2">
              Sex
              <select
                value={flags.female ? "F" : "M"}
                onChange={(e) => setFlags((s) => ({ ...s, female: e.target.value === "F" }))}
                className="rounded-md border border-line bg-surface px-2 py-1 text-foreground"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Age
              <select
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="rounded-md border border-line bg-surface px-2 py-1 text-foreground"
              >
                {[13, 14, 15, 16, 17, 18].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Grade
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="rounded-md border border-line bg-surface px-2 py-1 text-foreground"
              >
                {[9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-6">
          <svg viewBox="0 0 200 120" className="w-full max-w-[260px]" aria-hidden>
            <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="14" strokeLinecap="round" />
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke={pct >= 50 ? "#fb7185" : pct >= 25 ? "#fbbf24" : "#34d399"}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${(risk * 251).toFixed(0)} 251`}
              style={{ transition: "stroke-dasharray 0.5s, stroke 0.5s" }}
            />
            <text x="100" y="88" textAnchor="middle" fill="#e2e8f0" fontSize="34" fontWeight="600">
              {pct}%
            </text>
            <text x="100" y="106" textAnchor="middle" fill="#8fa0b8" fontSize="10">
              estimated probability
            </text>
          </svg>
          <p className="mt-3 text-center text-xs text-muted">
            Cohort base rate: <span className="text-foreground">{Math.round(base * 100)}%</span>
            {" · "}this profile:{" "}
            <span className={rel >= 1.5 ? "text-exposed" : rel <= 0.75 ? "text-good" : "text-adversity"}>
              {rel.toFixed(1)}× base rate
            </span>
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Logistic model scored client-side from exported coefficients (trained on the YRBS
        analytic sample, validated on a held-out test set). Cohort-level illustration for
        prioritizing <span className="text-foreground">supportive outreach</span> — not an
        individual diagnostic, and never a substitute for professional judgment.
      </p>
    </div>
  );
}
