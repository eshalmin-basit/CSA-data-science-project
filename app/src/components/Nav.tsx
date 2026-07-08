"use client";

import Link from "next/link";

const LINKS = [
  ["/#findings", "Findings"],
  ["/#dose", "Dose–response"],
  ["/#odds", "Adjusted odds"],
  ["/#models", "Prediction"],
  ["/#shap", "SHAP"],
  ["/#mediation", "Mediation"],
  ["/#limitations", "Limitations"],
] as const;

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-exposed" />
          Trauma, Coping &amp; Risk
          <span className="hidden text-muted sm:inline">· 2023 YRBS</span>
        </Link>
        <div className="hidden items-center gap-5 text-[0.8rem] text-muted md:flex">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
          <Link
            href="/screening"
            className="rounded-full bg-good/10 px-3 py-1 font-medium text-good ring-1 ring-good/40 transition-colors hover:bg-good/20"
          >
            Screening Lab
          </Link>
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
