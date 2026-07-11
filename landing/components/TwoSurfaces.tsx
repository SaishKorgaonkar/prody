import { ButtonPrimary, ButtonSecondary, FilterChip, Section, SectionHeading } from "./ui";

const surfaces = [
  {
    id: "extension",
    chip: "IDE Extension",
    title: "Start in your editor",
    subtitle: "Cursor · VS Code · Antigravity",
    body: "Say \"deploy this securely\" and Prody inspects your repo, fixes issues, and continues on the dashboard when you need full visibility.",
    bullets: ["Lives in your IDE workflow", "Reads your workspace context", "Same session on the web"],
    cta: "Connect Extension",
    ctaHref: "#extension",
  },
  {
    id: "dashboard",
    chip: "Web Dashboard",
    title: "Start with a GitHub link",
    subtitle: "GitHub · Drag & drop",
    body: "Paste a repo URL or drop a zip. Prody runs security scans, plans infrastructure, deploys, and monitors, all in plain language.",
    bullets: ["No IDE required", "Live agent activity feed", "Production readiness score"],
    cta: "Open Dashboard",
    ctaHref: "#dashboard",
  },
];

export function TwoSurfaces() {
  return (
    <Section id="surfaces" variant="white">
      <SectionHeading
        label="One engine, two surfaces"
        title="Wherever you start, Prody takes over"
        description="Submit a repo, describe your goal, approve when it matters. Prody handles the rest."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {surfaces.map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="rounded-2xl border border-hairline bg-stone p-8 md:p-10"
          >
            <FilterChip active={s.id === "extension"}>{s.chip}</FilterChip>
            <h3 className="font-display mt-5 text-[28px] leading-[1.2] tracking-[-0.32px] text-ink md:text-[32px]">
              {s.title}
            </h3>
            <p className="mt-1 text-[14px] text-ink-muted">{s.subtitle}</p>
            <p className="mt-4 text-[16px] leading-[1.5] text-ink-muted">{s.body}</p>
            <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[14px] text-ink">
                  <span className="text-action-blue">✓</span> {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonPrimary href={s.ctaHref}>{s.cta}</ButtonPrimary>
              <ButtonSecondary href="#how-it-works">Learn more</ButtonSecondary>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
