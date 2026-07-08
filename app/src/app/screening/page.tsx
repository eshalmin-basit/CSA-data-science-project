import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Section from "@/components/Section";
import CurvesPanel from "@/components/screening/CurvesPanel";
import DecisionCurvePanel from "@/components/screening/DecisionCurvePanel";
import FairnessAudit from "@/components/screening/FairnessAudit";
import RiskCalculator from "@/components/screening/RiskCalculator";
import ThresholdExplorer from "@/components/screening/ThresholdExplorer";
import screening from "@/data/screening.json";

export const metadata: Metadata = {
  title: "Screening Lab — Trauma, Coping & Risk",
  description:
    "Calibrated risk models for school health teams: interactive risk calculator, threshold explorer, decision-curve analysis, and fairness audit.",
};

const anySub = screening.any_current_substance;
const op80 = anySub.models.xgboost_calibrated.operating_points.recall_80!;

export default function ScreeningPage() {
  return (
    <main>
      <Nav />

      <header className="hero-gradient border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:pb-20 md:pt-24">
          <p className="eyebrow text-good">Screening Lab · from findings to a working tool</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            What if school health teams could find at-risk students{" "}
            <span className="text-good">before</span> the behavior consolidates?
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            The models below use only what a counselor could learn in one confidential
            intake conversation — victimization, household adversity, living situation.
            No behavior reports, no protected attributes. Trained on the YRBS analytic
            sample, tuned with 5-fold CV, probability-calibrated, and evaluated on a
            held-out test set the models never saw.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="card p-6">
              <div className="text-3xl font-semibold text-good">
                {(op80.recall * 100).toFixed(0)}%
              </div>
              <p className="mt-2 text-sm text-foreground">
                of students using substances are caught at the recommended operating point
              </p>
            </div>
            <div className="card p-6">
              <div className="text-3xl font-semibold text-unexposed">
                {(op80.precision * 100).toFixed(0)}%
              </div>
              <p className="mt-2 text-sm text-foreground">
                of alerts are true positives — vs a {(anySub.prevalence * 100).toFixed(0)}% base
                rate if you picked students at random
              </p>
            </div>
            <div className="card p-6">
              <div className="text-3xl font-semibold text-exposed">13</div>
              <p className="mt-2 text-sm text-foreground">
                intake questions. That&apos;s the entire input — data schools can already collect
              </p>
            </div>
          </div>
        </div>
      </header>

      <Section
        id="calculator"
        eyebrow="Interactive · Risk profile"
        title="Build a student profile, watch the risk move"
        accent="text-good"
        lead="Toggle the intake answers and the model scores the profile live, client-side, from the exported coefficients. Notice what dominates: dating violence, sexual-violence exposure, household adversity — and how the protective basic-needs item pulls risk down."
      >
        <RiskCalculator />
      </Section>

      <Section
        id="threshold"
        eyebrow="Interactive · Operating point"
        title="Where you set the threshold is a policy decision — explore it"
        lead="Drag the slider. Lower thresholds catch more at-risk students but flag more who are fine; higher thresholds are precise but miss kids. The presets mark the sensitivity-first operating points recommended for supportive (non-punitive) screening."
      >
        <ThresholdExplorer />
      </Section>

      <Section
        id="curves"
        eyebrow="Validation · Held-out test set"
        title="Discrimination, precision, and calibration — the receipts"
        accent="text-unexposed"
        lead="A screening probability is only useful if it's honest. Calibrated XGBoost vs logistic baseline on data neither model saw during training or tuning."
      >
        <CurvesPanel />
      </Section>

      <Section
        id="benefit"
        eyebrow="Impact · Decision-curve analysis"
        title="Is model-guided outreach actually better than screening everyone?"
        accent="text-adversity"
        lead="Net-benefit analysis answers the question administrators actually ask: compared to a blanket program for all students, or none, what does targeting by model risk buy?"
      >
        <DecisionCurvePanel />
      </Section>

      <Section
        id="fairness"
        eyebrow="Accountability · Fairness audit"
        title="Audited on protected attributes — never trained on them"
        accent="text-mediation"
        lead="A tool that allocates support must work comparably across groups. Subgroup performance at the deployed operating point:"
      >
        <FairnessAudit />
      </Section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <div className="card border-l-2 border-l-exposed/60 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">What this tool is — and is not</h2>
          <div className="mt-4 grid gap-6 text-[0.85rem] leading-relaxed text-muted md:grid-cols-2">
            <div>
              <p className="font-medium text-good">It is</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                <li>A prioritization aid for confidential, supportive outreach by school health professionals</li>
                <li>Built on cross-sectional, self-reported survey data with honest, held-out validation</li>
                <li>Fully reproducible — every number traces to the public CDC microdata</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-exposed">It is not</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                <li>A diagnostic instrument, or grounds for any disciplinary or punitive action</li>
                <li>Validated for real-world deployment — that requires prospective evaluation, IRB oversight, and community consent</li>
                <li>A causal model: it predicts association-based risk, not destiny</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted">
            Read the full framing in the{" "}
            <Link href="/" className="text-foreground underline decoration-line underline-offset-4">
              main findings
            </Link>{" "}
            and the paper&apos;s ethics section.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
