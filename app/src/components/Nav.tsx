"use client";

const LINKS = [
  ["findings", "Findings"],
  ["dose", "Dose–response"],
  ["odds", "Adjusted odds"],
  ["models", "Prediction"],
  ["shap", "SHAP"],
  ["mediation", "Mediation"],
  ["methods", "Methods"],
  ["limitations", "Limitations"],
] as const;

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-exposed" />
          Trauma, Coping &amp; Risk
          <span className="hidden text-muted sm:inline">· 2023 YRBS</span>
        </a>
        <div className="hidden items-center gap-5 text-[0.8rem] text-muted md:flex">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="transition-colors hover:text-foreground">
              {label}
            </a>
          ))}
        </div>
        <a
          href="https://github.com/eshalmin-basit/CSA-data-science-project"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-exposed/60 hover:text-foreground"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
