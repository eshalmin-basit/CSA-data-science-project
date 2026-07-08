export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-foreground">
              Trauma, Coping &amp; Risk — 2023 National YRBS
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Built on CDC public-use microdata. All results are weighted risk-factor
              associations from a cross-sectional survey — never individual predictions,
              never causal claims. If you or someone you know needs support, call or text{" "}
              <span className="text-foreground">988</span> (US Suicide &amp; Crisis Lifeline).
            </p>
          </div>
          <div className="flex gap-5 text-xs text-muted">
            <a
              className="transition-colors hover:text-foreground"
              href="https://github.com/eshalmin-basit/CSA-data-science-project"
              target="_blank"
              rel="noreferrer"
            >
              Code &amp; paper ↗
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="https://www.cdc.gov/yrbs/data/index.html"
              target="_blank"
              rel="noreferrer"
            >
              CDC YRBS data ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
