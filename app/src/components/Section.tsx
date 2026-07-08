export default function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  accent = "text-exposed",
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 md:py-20">
      <p className={`eyebrow ${accent}`}>{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {lead && <div className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-muted">{lead}</div>}
      <div className="mt-10">{children}</div>
    </section>
  );
}
