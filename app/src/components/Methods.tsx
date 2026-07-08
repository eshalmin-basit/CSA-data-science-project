const ITEMS = [
  {
    title: "Data & design",
    body: "CDC 2023 National Youth Risk Behavior Survey — a three-stage cluster sample (counties → schools → classes) of 20,103 students in grades 9–12, representative of US high school students. All prevalence estimates use survey weights; regression inference uses cluster-robust standard errors on school clusters.",
  },
  {
    title: "Exposure definition",
    body: "csa_exposure = any of: ever physically forced intercourse (Q19), sexual violence by anyone in the past 12 months (Q20), sexual dating violence (Q21). YRBS records no age-at-victimization, so this is adolescent-reported sexual-violence victimization — a proxy for CSA, and a lower bound given underreporting.",
  },
  {
    title: "Missing data, diagnosed first",
    body: "The dominant mechanism is structural: students in schools sampled for both national and state surveys took their state questionnaire, which lacks the 20 new-to-2023 items (ACEs, connectedness, monitoring). 83–87% of school clusters are all-or-none missing on that block, and the receiving subsample matches the full sample within 0.7pp on every checked measure. Those variables are analyzed in the subsample that received them. Exposures and outcomes are never imputed.",
  },
  {
    title: "Models",
    body: "L2 logistic regression baselines and XGBoost, 5-fold stratified CV, class-weight vs SMOTE comparison, recall prioritized for the screening use-case. Psychological mediators are excluded from predictive features (they lie on the hypothesized pathway); they are tested separately with Imai-style causal mediation (probit, 500 quasi-Bayesian draws).",
  },
];

export default function Methods() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ITEMS.map((it) => (
        <div key={it.title} className="card p-6">
          <h3 className="text-sm font-semibold text-foreground">{it.title}</h3>
          <p className="mt-2.5 text-[0.85rem] leading-relaxed text-muted">{it.body}</p>
        </div>
      ))}
    </div>
  );
}
