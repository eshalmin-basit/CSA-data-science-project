const LIMITS = [
  {
    title: "Cross-sectional, not causal",
    body: "Exposure, mediators, and outcomes are measured at the same moment. Nothing here shows that trauma causes substance use — only that they travel together, strongly and consistently. Mediation estimates assume a temporal ordering the data cannot verify.",
  },
  {
    title: "Proxy exposure measure",
    body: "YRBS does not ask age at first victimization or perpetrator identity. The composite captures sexual-violence victimization reported in adolescence, not a clinical CSA determination — and survivors who chose not to disclose are counted as unexposed, biasing associations toward zero.",
  },
  {
    title: "Single-item mental health measures",
    body: "No PHQ-9 or GAD-7 — persistent sadness and poor mental health are single self-report items. Measurement error here likely deflates the mediated proportions.",
  },
  {
    title: "Self-report throughout",
    body: "Substance use and victimization are self-reported in a school setting, subject to recall and social-desirability bias. Out-of-school youth — plausibly higher-risk — are outside the sampling frame entirely.",
  },
];

export default function Limitations() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {LIMITS.map((l) => (
        <div key={l.title} className="card border-l-2 border-l-exposed/60 p-6">
          <h3 className="text-sm font-semibold text-foreground">{l.title}</h3>
          <p className="mt-2.5 text-[0.85rem] leading-relaxed text-muted">{l.body}</p>
        </div>
      ))}
    </div>
  );
}
