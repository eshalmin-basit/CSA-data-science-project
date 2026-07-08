import DoseResponse from "@/components/DoseResponse";
import FindingsChart from "@/components/FindingsChart";
import Footer from "@/components/Footer";
import ForestPlot from "@/components/ForestPlot";
import Hero from "@/components/Hero";
import Limitations from "@/components/Limitations";
import MediationViz from "@/components/MediationViz";
import Methods from "@/components/Methods";
import ModelMetrics from "@/components/ModelMetrics";
import Nav from "@/components/Nav";
import Section from "@/components/Section";
import ShapExplorer from "@/components/ShapExplorer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />

      <Section
        id="findings"
        eyebrow="Finding 01 · The gradient"
        title="Exposed students use more of everything — and the gap widens with severity"
        lead={
          <>
            Weighted prevalence of each outcome among students reporting sexual-violence
            victimization vs those who don&apos;t. Common substances show 2–4× gaps; the
            rarest, most dangerous ones show 6–8×. That severity gradient is what a
            coping-escalation account predicts — and what a &ldquo;risky personality&rdquo;
            stereotype does not.
          </>
        }
      >
        <FindingsChart />
      </Section>

      <Section
        id="dose"
        eyebrow="Finding 02 · Dose–response"
        title="Each additional household adversity raises every outcome, monotonically"
        accent="text-adversity"
        lead="Household adversity counts parent/guardian problematic substance use, severe mental illness, and incarceration — the ACE items added to the national YRBS in 2023. The graded pattern replicates the classic ACE-study result in a current, nationally representative adolescent sample."
      >
        <DoseResponse />
      </Section>

      <Section
        id="odds"
        eyebrow="Finding 03 · Adjusted associations"
        title="The associations survive full adjustment"
        lead="Odds ratios adjusted for age, grade, sex, race/ethnicity — and for each other. Sexual-violence exposure and household adversity each contribute independently, on every outcome."
      >
        <ForestPlot />
      </Section>

      <Section
        id="models"
        eyebrow="Finding 04 · Prediction"
        title="Trauma variables alone identify most at-risk students"
        accent="text-good"
        lead="Cross-validated performance predicting each outcome from exposure, adversity, and demographics only — no behavioral inputs, and no mental-health mediators (they sit on the causal pathway). Sensitivity is prioritized: for screening, a missed at-risk student costs more than a false positive."
      >
        <ModelMetrics />
      </Section>

      <Section
        id="shap"
        eyebrow="Finding 05 · Interpretability"
        title="What the models actually use: victimization first, demographics second"
        lead="SHAP decomposes every individual prediction into feature contributions. Across all eight outcomes, the victimization and adversity block outranks every demographic feature."
      >
        <ShapExplorer />
      </Section>

      <Section
        id="mediation"
        eyebrow="Finding 06 · Pathways"
        title="A fifth of the substance pathway — and half the withdrawal pathway — runs through distress"
        accent="text-mediation"
        lead="If substance use and withdrawal are coping responses, psychological distress should carry part of the exposure–outcome association. It does: persistent sadness/hopelessness mediates ~15–23% of each substance pathway and 46% of the school-connectedness pathway."
      >
        <MediationViz />
      </Section>

      <Section
        id="methods"
        eyebrow="Methodology"
        title="Design-aware from raw Access database to final estimate"
        accent="text-unexposed"
        lead={
          <>
            Every number on this page is precomputed from the reproducible pipeline in the{" "}
            <a
              href="https://github.com/eshalmin-basit/CSA-data-science-project"
              className="text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground"
              target="_blank"
              rel="noreferrer"
            >
              repository
            </a>
            , including the full research paper draft.
          </>
        }
      >
        <Methods />
      </Section>

      <Section
        id="limitations"
        eyebrow="Read this before citing anything"
        title="What this study cannot say"
        lead="Honest limits are part of the finding. The four that matter most:"
      >
        <Limitations />
      </Section>

      <Footer />
    </main>
  );
}
