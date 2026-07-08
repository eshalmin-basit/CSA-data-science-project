import overview from "@/data/overview.json";

const stats = [
  {
    value: `${overview.csa_exposure_weighted_pct}%`,
    label: "of US high-schoolers report sexual-violence victimization",
    sub: `${overview.csa_exposure_female_pct}% of girls · ${overview.csa_exposure_male_pct}% of boys`,
    color: "text-exposed",
  },
  {
    value: "2.2–7.9×",
    label: "higher prevalence of every substance outcome among exposed students",
    sub: "the rarer the substance, the larger the gap",
    color: "text-adversity",
  },
  {
    value: `${overview.sad_hopeless_exposed_pct}%`,
    label: "of exposed students report persistent sadness or hopelessness",
    sub: `vs ${overview.sad_hopeless_unexposed_pct}% of unexposed students`,
    color: "text-mediation",
  },
];

export default function Hero() {
  return (
    <header id="top" className="hero-gradient border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:pb-24 md:pt-28">
        <p className="eyebrow text-unexposed">
          2023 National Youth Risk Behavior Survey · N = {overview.n_students.toLocaleString()}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Trauma doesn&apos;t make teens reckless.
          <br />
          <span className="glow-exposed text-exposed">It makes them cope.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          A machine-learning study of how sexual-violence victimization and household
          adversity relate to adolescent substance use and social withdrawal — in a
          nationally representative sample of 20,103 US high school students.
          Cross-sectional, self-reported, and framed strictly as{" "}
          <span className="text-foreground">risk factors, not causes</span>.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <div className={`text-4xl font-semibold tracking-tight ${s.color}`}>{s.value}</div>
              <p className="mt-3 text-sm leading-snug text-foreground">{s.label}</p>
              <p className="mt-1.5 text-xs text-muted">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
